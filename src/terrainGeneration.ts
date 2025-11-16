import {MersenneTwister19937, Random} from "random-js";
import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {CellType} from "./course";
import {HexPoint2D, RectDirection, RectPoint2D} from "$lib/maths/point2D";
import {
    HexRegion2D,
    HexTile,
    HexTiling2D,
    RectRegion2D,
    RectTile,
    RectTiling2D,
    type Region2D,
    type Tile,
    type Tiling2D
} from "$lib/maths/tiling2D";
import {type Function2D, LiteralFunction2D, NumericFunction2D, NumericLiteralFunction2D} from "$lib/maths/function2D";

export class MapBuilder<T extends Tile> {
    readonly plane: Region2D<T>;
    #rng: Random;
    #globalScale: number = 1;

    constructor(plane: Region2D<T>, rng: Random) {
        this.plane = plane;
        this.#rng = rng;
    }

    nextRng(): Random {
        return new Random(MersenneTwister19937.seed(this.#rng.uint32()));
    }

    setGlobalNoiseScale(scale: number) {
        this.#globalScale = scale;
    }

    buildNoiseMap(scale: number): NumericFunction2D {
        let noise = new Noise2D(scale*this.#globalScale, this.nextRng());
        return noise.multiply(0.5, 1);
    }

    buildWarpNoiseMap(scale: number, warpScale: number, warpAmount: number): NumericFunction2D {
        let inner = new Noise2D(scale*this.#globalScale, this.nextRng());
        let noise = new NoiseWarp2D(inner, warpScale*this.#globalScale, warpAmount/this.#globalScale, this.nextRng());
        return noise.asNumeric().multiply(0.5, 1);
    }

    buildLoopyNoiseMap(scale: number, warpAmount: number, warpVarianceScale: number, warpVariance: number, loopScale: number, loopiness: number): NumericFunction2D {
        let inner = new Noise2D(scale*this.#globalScale, this.nextRng());
        let noise = new LoopyWarp2D(inner, warpAmount/this.#globalScale, warpVarianceScale*this.#globalScale, warpVariance/this.#globalScale, loopScale*this.#globalScale, loopiness, this.nextRng());
        return noise.asNumeric().multiply(0.5, 1);
    }
}


export class Noise2D extends NumericLiteralFunction2D {
    #noise: NoiseFunction2D;
    #scale: number;
    #offsetX: number;
    #offsetY: number;

    constructor(scale: number, rng: Random) {
        super(p => {
            const pR = p.toRect();
            return this.#noise(pR.x/this.#scale + this.#offsetX, pR.y/this.#scale + this.#offsetY);
        })
        this.#noise = createNoise2D(() => rng.real(0, 1));
        this.#scale = scale;
        this.#offsetX = rng.real(0, 1);
        this.#offsetY = rng.real(0, 1);
    }
}

export class NoiseWarp2D<T> extends LiteralFunction2D<T> {
    #inner: Function2D<T>;
    #warpX: Noise2D;
    #warpY: Noise2D;
    #warpAmount: number;

    constructor(inner: Function2D<T>, scale: number, amount: number, rng: Random) {
        super(p => {
            const warp = new RectPoint2D(
                this.#warpAmount*this.#warpX.get(p),
                this.#warpAmount*this.#warpY.get(p),
            );
            return this.#inner.get(p.add(warp));
        });
        this.#warpAmount = amount;
        this.#inner = inner;
        this.#warpX = new Noise2D(scale, rng);
        this.#warpY = new Noise2D(scale, rng);
    }
}

export class LoopyWarp2D<T> extends LiteralFunction2D<T> {
    #inner: Function2D<T>;
    #warpAngle: Noise2D;
    #warpVariance: Noise2D;
    #warpVarianceAmount: number;
    #warpAmount: number;
    #angleAmount: number;

    constructor(inner: Function2D<T>, amount: number, varianceScale: number, variance: number, loopScale: number, loopiness: number, rng: Random) {
        super(p => {
            const tau = 2*Math.PI;
            let angle = this.#angleAmount * this.#warpAngle.get(p) * tau; // Radians
            angle = ((angle % tau) + tau) % tau;
            let magnitude = this.#warpAmount + this.#warpVarianceAmount * this.#warpVariance.get(p);
            let warp: RectPoint2D;
            if (angle < 0.25*tau) {
                warp = new RectPoint2D(
                    magnitude*Math.cos(angle),
                    magnitude*Math.sin(angle),
                );
            } else if (angle < 0.5*tau) {
                warp = new RectPoint2D(
                    -magnitude*Math.sin(angle-0.25*tau),
                    magnitude*Math.cos(angle-0.25*tau),
                );
            } else if (angle < 0.75*tau) {
                warp = new RectPoint2D(
                    -magnitude*Math.cos(angle-0.5*tau),
                    -magnitude*Math.sin(angle-0.5*tau),
                );
            } else {
                warp = new RectPoint2D(
                    magnitude*Math.sin(angle-0.75*tau),
                    -magnitude*Math.cos(angle-0.75*tau),
                );
            }
            Math.tan(angle);
            return this.#inner.get(p.add(warp));

        });
        this.#inner = inner;
        this.#warpAmount = amount;
        this.#warpAngle = new Noise2D(loopScale, rng);
        this.#warpVariance = new Noise2D(varianceScale, rng);
        this.#warpVarianceAmount = variance;
        this.#angleAmount = loopiness*loopScale;
    }
}

export function loopErasedRandomWalk(walls: RectTiling2D<boolean>, start: RectPoint2D, end: RectPoint2D, rng: Random): RectPoint2D[] {
    let markDelay = 1;
    function positionHash(pos: RectPoint2D) { return pos.x + ',' + pos.y; }
    let startHash = positionHash(start);
    let path: {position: RectPoint2D, markedRegion: string[]}[] = [{position: start, markedRegion: [startHash]}];
    let markedCells: Set<string> = new Set([startHash]);
    let currentPosition: RectPoint2D = start;
    function pathPop() {
        const removed = path.pop() as {position: RectPoint2D; markedRegion: string[]};
        for (const markedHash of removed.markedRegion) {
            markedCells.delete(markedHash);
        }
    }
    function isOutOfBounds(p: RectPoint2D): boolean {
        return !walls.bounds.contains(p)
            || ((p.x === 0 || p.x === walls.bounds.width - 1) && (p.y === 0 || p.y === walls.bounds.height - 1)) // Disallow corners because it can get stuck in corners.
            || walls.get(p);
    }

    while (true) {
        let nextDirection: RectDirection = rng.integer(0, 7);
        let nextPosition = currentPosition.move(nextDirection);
        if (isOutOfBounds(nextPosition)) {
            // If path goes off edge, step back 2 steps. (Not required, but makes path avoid edge)
            for (let i = 0; i < Math.min(2, path.length - 1); i++) {
                pathPop();
            }
            currentPosition = path[path.length-1].position;
            continue;
        }

        if (nextPosition.equals(end)) {
            path.push({position: end, markedRegion: []});
            return path.map(step => step.position);
        }

        let nextPositionHash = positionHash(nextPosition);
        if (markedCells.has(nextPositionHash)) {
            // Step back

            let lastStep = path[path.length - 1];
            while (!lastStep.markedRegion.includes(nextPositionHash)) {
                if (path.length === 0) {
                    throw new Error("Path is empty!");
                }
                pathPop();
                lastStep = path[path.length - 1];
            }
            if (lastStep.position.equals(nextPosition)) {
                currentPosition = lastStep.position;
            } else {
                for (let i = 0; i < markDelay; i++) {
                    pathPop();
                }
                currentPosition = path[path.length-1].position;
            }
        } else {
            // Advance

            let nextMarked = [positionHash(nextPosition)];

            let delayedStep = path[path.length-1-markDelay];
            if (delayedStep !== undefined) {
                for (let y = -1; y < 2; y++) {
                    for (let x = -1; x < 2; x++) {
                        let cellToMark: RectPoint2D = delayedStep.position.add(new RectPoint2D(x, y));
                        if (cellToMark.equals(end)) {
                            for (let i = 0; i < markDelay; i++) {
                                pathPop();
                            }
                            path.push({position: end, markedRegion: []});
                            return path.map(step => step.position);
                        }
                        const hashToMark = positionHash(cellToMark);
                        if (!markedCells.has(hashToMark)) {
                            nextMarked.push(hashToMark);
                            markedCells.add(hashToMark);
                        }
                    }
                }
            }

            path.push({
                position: nextPosition,
                markedRegion: nextMarked,
            });
            currentPosition = nextPosition;
        }
    }
}

export function generateTeeAndHolePos(width: number, height: number, xEdge: number, yEdge: number, rng: Random): [RectPoint2D, RectPoint2D] {
    const positionLimit = 0.4;

    const positionRng = new Random(MersenneTwister19937.seed(rng.uint32()));
    function generatePosition(longSide: number, shortSide: number, longEdge: number, shortEdge: number, longLimit: number): [number, number] {
        let posLong = positionRng.integer(longEdge, (longSide - 2*longEdge) * Math.abs(longLimit) - 1);
        if (longLimit < 0) {
            posLong = longSide - posLong - 1;
        }
        return [posLong, positionRng.integer(shortEdge, shortSide - 2*shortEdge - 1)]
    }
    let holePos: RectPoint2D, teePos: RectPoint2D;
    let teeAtTop = positionRng.pick([-1, 1]);
    if (width > height) {
        let [x, y] = generatePosition(width, height, xEdge, yEdge, -teeAtTop*positionLimit);
        teePos = new RectPoint2D(x, y);
        [x, y] = generatePosition(width, height, xEdge, yEdge, teeAtTop*positionLimit);
        holePos = new RectPoint2D(x, y);
    } else {
        let [y, x] = generatePosition(height, width, yEdge, xEdge, -teeAtTop*positionLimit);
        teePos = new RectPoint2D(x, y);
        [y, x] = generatePosition(height, width, yEdge, xEdge, teeAtTop*positionLimit);
        holePos = new RectPoint2D(x, y);
    }

    return [teePos, holePos];
}

export class TerrainDebugSetting<T> {
    id: string;
    name: string;
    value: T;

    constructor(id: string, name: string, defaultValue: T) {
        this.id = id;
        this.name = name;
        this.value = defaultValue;
    }
}

export class TerrainDebugRadioGroup extends TerrainDebugSetting<string> {
    options: {id: string, name: string}[];

    constructor(id: string, name: string, defaultOptionId: string, defaultOptionName: string) {
        super(id, name, defaultOptionId);
        this.options = [{id: defaultOptionId, name: defaultOptionName}];
    }

    addOption(id: string, name: string) {
        this.options.push({id: id, name: name});
        return this;
    }
}

export class TerrainDebugBool extends TerrainDebugSetting<boolean> {
    constructor(id: string, name: string, defaultValue: boolean) {
        super(id, name, defaultValue);
    }
}

export class TerrainDebugNumber extends TerrainDebugSetting<number> {
    sliderMin: number;
    sliderMax: number;
    sliderStep: number;

    constructor(id: string, name: string, sliderMin: number, sliderMax: number, sliderStep: number, defaultValue: number) {
        super(id, name, defaultValue);
        this.sliderMin = sliderMin;
        this.sliderMax = sliderMax;
        this.sliderStep = sliderStep;
    }
}

export class TerrainDebugSettings {
    settings: TerrainDebugSetting<any>[] = [];

    addSetting(setting: TerrainDebugSetting<any>) {
        this.settings.push(setting);
        return this;
    }

    setting(id: string) {
        return this.settings.find(setting => setting.id === id) ?? null;
    }

    is(settingId: string, value: any): boolean {
        return this.setting(settingId)?.value === value;
    }

    get(settingId: string): any|null {
        return this.setting(settingId)?.value ?? null;
    }
}

export function createTerrainDebugSettings() {
    return new TerrainDebugSettings()
        .addSetting(new TerrainDebugBool('hex', 'Hex?', false))
        .addSetting(new TerrainDebugRadioGroup('map', 'Map', 'result', 'Result')
            .addOption('edge', "Edge")
            .addOption('walls', "Walls")
            .addOption('path', 'Path')
            .addOption('pathEnds', 'Path Ends')
            .addOption('l', 'Land')
            .addOption('w', 'Water')
            .addOption('r', 'Rock')
            .addOption('f', 'Fairway')
            .addOption('t', 'Trees')
            .addOption('s', 'Sand')
            .addOption('noise', 'Noise')
        )
        .addSetting(new TerrainDebugRadioGroup('mapStage', 'Map Stage', 'end', 'End')
            .addOption('1', '1')
            .addOption('2', '2')
            .addOption('3', '3')
        )
        .addSetting(new TerrainDebugNumber('a', 'A', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugNumber('b', 'B', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugNumber('c', 'C', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugBool('m', 'M', false))
        .addSetting(new TerrainDebugBool('n', 'N', false))
    ;
}

export class DebugMap<T extends Tile> {
    map: Tiling2D<T, number | boolean>;

    constructor(map: Tiling2D<T, number | boolean>) {
        this.map = map;
    }
}

export function generateTerrainDebug(width: number, height: number, xEdge: number, yEdge: number, teePos: RectPoint2D, holePos: RectPoint2D, rng: Random, debug?: TerrainDebugSettings): RectTiling2D<CellType> | DebugMap<RectTile> {
    const region = new RectRegion2D(width, height);
    let mB = new MapBuilder(region, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(region.tile(
        mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03)
    ));

    let edgeProximityMapOld = region.tile(p => {
        const rectPoint = p.toRect();
        const x = rectPoint.x;
        const y = rectPoint.y;
        let edgeProximity = 1;
        if (x <= xEdge + 1) {
            edgeProximity *= Math.pow((x+1.5)/(xEdge+3.5), 0.85);
        }
        if (x >= width-xEdge-1) {
            edgeProximity *= Math.pow((width - 1 - (x-1.5))/(xEdge+3.5), 0.85);
        }
        if (y <= yEdge + 1) {
            edgeProximity *= Math.pow((y+1.5)/(yEdge+3.5), 0.85);
        }
        if (y >= height-yEdge-1) {
            edgeProximity *= Math.pow((height - 1 - (y-1.5))/(yEdge+3.5), 0.85);
        }
        return edgeProximity;
    }).asNumeric();
    const w = 3;
    let edgeProximityFn = new NumericLiteralFunction2D(p => {
        let pR = p.toRect();
        let x = Math.max(
            -w,
            pR.x - region.width + 1,
            - pR.x,
        ) + w;
        let y = Math.max(
            -w,
            pR.y - region.height + 1,
            - pR.y,
        ) + w;
        return x + y;
    }).multiply(0.2);
    if (debug?.is('map', 'edge')) return new DebugMap(debug?.get('m') ? edgeProximityMapOld.invert() : region.tile(edgeProximityFn));


    let center: RectPoint2D = new RectPoint2D(Math.round((teePos.x + holePos.x)/2), Math.round((teePos.y + holePos.y)/2));
    let distance = teePos.sub(holePos).magnitude();
    let radius = Math.min(Math.min(width-2*xEdge, height-2*yEdge) / 6, distance/2-1.5);
    let walls = region.tile(p => {
        const x = p.x;
        const y = p.y;
        if (Math.abs(center.x-x) <= radius && Math.abs(center.y-y) <= radius
            && center.sub(p).magnitude() < radius) {
            return true;
        }
        if (x < xEdge || x >= width - xEdge || y < yEdge || y >= height - yEdge) {
            return true;
        }
        return false;
    });
    if (debug?.is('map', 'walls')) return new DebugMap(walls);

    let path = loopErasedRandomWalk(walls, teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

    let pathMap = region.tilingOf(0).asNumeric();
    for (const pos of path) {
        pathMap.set(pos, 1);
    }

    let endsMap = region.tilingOf(0).asNumeric();
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (endsMap.data[holePos.x+offset[0]][holePos.y+offset[1]] !== undefined)
            endsMap.data[holePos.x+offset[0]][holePos.y+offset[1]] = 0.65;
    }
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (endsMap.data[teePos.x+offset[0]][teePos.y+offset[1]] === 0)
            endsMap.data[teePos.x+offset[0]][teePos.y+offset[1]] = 0.45;
    }
    let endWeights = [1.5, 1, 0.85, 0.7, 0.5, 0.3];
    endWeights.forEach((weight, i) => {
        let stepFromStart = path[i];
        if (stepFromStart !== undefined) {
            endsMap.data[stepFromStart.x][stepFromStart.y] += weight;
        }
        let stepFromEnd = path[path.length - 1 - i];
        if (stepFromEnd !== undefined) {
            endsMap.data[stepFromEnd.x][stepFromEnd.y] += weight;
        }
    })

    pathMap.blur(1.7).multiply(3).clamp();
    endsMap.blur(1.7).multiply(4.5).clamp();

    if (debug?.is('map', 'path')) return new DebugMap(!debug?.get('m') ? pathMap: pathMap);
    if (debug?.is('map', 'pathEnds')) return new DebugMap(endsMap);

    let landMap = region.product(
        region.tile(
            NumericFunction2D.product(
                mB.buildWarpNoiseMap(7, 8, 2.5),
                edgeProximityFn.invert().pinch(0.2, 1),
            ).invert()
        ),
        endsMap.copy().invert(),
        pathMap.copy().multiply(0.08).invert()
    ).invert().pinch(-0.5, 1);
    if (debug?.is('map', 'l')) return new DebugMap(landMap);

    let waterMap = landMap.copy().invert().threshold(0.5).blur(0.35).boolThreshold(0.5);
    if (debug?.is('map', 'w')) return new DebugMap(waterMap);

    let fairwayMapV = region.product(
        region.product(
            region.tile(NumericFunction2D.offsetSum(0.5,
                mB.buildWarpNoiseMap(10, 8, 3)
            )),
            landMap.copy().multiply(0.85).add(0.125).clamp()
        ).invert(),
        endsMap.copy().multiply(3.5, 1).clamp().invert()
    ).invert();
    if (debug?.is('map', 'f')) return new DebugMap(fairwayMapV);
    let fairwayMap = fairwayMapV.boolThreshold(0.5);

    let rockMapV = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(25).multiply(0, 0.5),
            mB.buildWarpNoiseMap(12, 12, 6),
        )),
        landMap.copy().add(0.25).clamp(),
        pathMap.copy().pinch(-0.2, 1, 0.2).clamp().multiply(0.8).invert(),
        endsMap.copy().multiply(2, 1).clamp().invert()
    );
    if (debug?.is('map', 'r')) return new DebugMap(!debug?.get('m') ? rockMapV : landMap.copy().add(0.25).clamp());
    let rockMap = rockMapV.copy().threshold(0.665).blur(0.5).boolThreshold(0.4);

    let sandMapV = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(10).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(4.5, 8, 4).multiply(1, 0.5),
        )),
        landMap.copy().invert().multiply(4).add(0.25).clamp(),
        pathMap.copy().pinch(0.5, 1).clamp().multiply(0.5).invert(),
    ).threshold(0.58).blur(2);
    if (debug?.is('map', 's')) return new DebugMap(!debug?.get('m')?sandMapV:pathMap.copy().pinch(0.5, 1).clamp().multiply(0.5).invert());
    let sandMap = sandMapV.boolThreshold(0.4);

    let treeMapV = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildWarpNoiseMap(10, 15, 2.5).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(7, 10, 2).multiply(0.5, 0.5),
            mB.buildWarpNoiseMap(3, 8, 2).multiply(1, 0.5)
        )),
        landMap.copy().multiply(1.5).add(0.225).clamp(),
        endsMap.copy().multiply(2, 1).clamp().invert(),
        fairwayMapV.copy().multiply(3, 1).clamp().invert(),
        sandMapV.copy().multiply(1.5, 1).clamp().invert(),
    );
    if (debug?.is('map', 't')) return new DebugMap(treeMapV);
    let treeMap = treeMapV.boolThreshold(0.65);

    return region.tile(p => {
        if (p.equals(holePos)) {
            return CellType.Hole;
        }
        switch (true) {
            case waterMap.get(p):
                return CellType.Water;
            case rockMap.get(p):
                return CellType.Rock;
            case treeMap.get(p):
                return CellType.Tree;
            case sandMap.get(p):
                return CellType.Sand;
            case fairwayMap.get(p):
                return CellType.Fairway;
            default:
                return CellType.Rough;
        }
    });
}
export function generateHexTerrainDebug(size: number, xEdge: number, yEdge: number, teePos: HexPoint2D, holePos: HexPoint2D, rng: Random, debug?: TerrainDebugSettings): HexTiling2D<CellType> | DebugMap<HexTile> {
    const region = new HexRegion2D(-size + 1, size, -size + 1, size, -size + 1, size);
    let mB = new MapBuilder(region, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(region.tile(
        mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03)
    ));


    const w = 3;
    let edgeProximityFn = new NumericLiteralFunction2D(p => {
        let pH = p.toHex();
        let q = Math.max(-w,
            pH.q - region.qMax + 1,
            region.qMin - pH.q,
        ) + w;
        let r = Math.max(-w,
            pH.r - region.rMax + 1,
            region.rMin - pH.r,
        ) + w;
        let s = Math.max(-w,
            pH.s - region.sMax + 1,
            region.sMin - pH.s,
        ) + w;
        return q + r + s;
    }).multiply(0.2);
    if (debug?.is('map', 'edge')) return new DebugMap(region.tile(edgeProximityFn));

    // let center: RectPoint = new RectPoint(Math.round((teePos.x + holePos.x)/2), Math.round((teePos.y + holePos.y)/2));
    // let distance = teePos.sub(holePos).magnitude();
    // let radius = Math.min(Math.min(width-2*xEdge, height-2*yEdge) / 6, distance/2-1.5);
    // let walls = plane.tilingBuild(p => {
    //     const x = p.x;
    //     const y = p.y;
    //     if (Math.abs(center.x-x) <= radius && Math.abs(center.y-y) <= radius
    //         && center.sub(p).magnitude() < radius) {
    //         return true;
    //     }
    //     if (x < xEdge || x >= width - xEdge || y < yEdge || y >= height - yEdge) {
    //         return true;
    //     }
    //     return false;
    // });
    // if (debug?.is('map', 'walls')) return new DebugMap(walls);

    // let path = loopErasedRandomWalk(walls, teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

    // let rawPathMap = plane.tilingOf(0);
    // for (const pos of path) {
    //     rawPathMap.set(pos, 1);
    // }
    // let pathMap = mB.fromTiledPlane(rawPathMap.copy());

    // let endsTiling = plane.tilingOf(0);
    // for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    //     if (endsTiling.data[holePos.x+offset[0]][holePos.y+offset[1]] !== undefined)
    //         endsTiling.data[holePos.x+offset[0]][holePos.y+offset[1]] = 0.65;
    // }
    // for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    //     if (endsTiling.data[teePos.x+offset[0]][teePos.y+offset[1]] === 0)
    //         endsTiling.data[teePos.x+offset[0]][teePos.y+offset[1]] = 0.45;
    // }
    // let endWeights = [1.5, 1, 0.85, 0.7, 0.5, 0.3];
    // endWeights.forEach((weight, i) => {
    //     let stepFromStart = path[i];
    //     if (stepFromStart !== undefined) {
    //         endsTiling.data[stepFromStart.x][stepFromStart.y] += weight;
    //     }
    //     let stepFromEnd = path[path.length - 1 - i];
    //     if (stepFromEnd !== undefined) {
    //         endsTiling.data[stepFromEnd.x][stepFromEnd.y] += weight;
    //     }
    // })
    // let endsMap = mB.fromTiledPlane(endsTiling);

    // pathMap.blur(1.7).scale(3).clamp();
    // endsMap.blur(1.7).scale(4.5).clamp();

    // if (debug?.is('map', 'path')) return new DebugMap(!debug?.get('m') ? pathMap.inner: rawPathMap);
    // if (debug?.is('map', 'pathEnds')) return new DebugMap(endsMap.inner);

    let landMap = region.tile(
        NumericFunction2D.product(
            NumericFunction2D.product(
                mB.buildWarpNoiseMap(7, 8, 2.5),
                edgeProximityFn.invert().pinch(0.2, 1),
            ).invert(),
            // endsMap.copy().invert(),
            // pathMap.copy().scale(0.08).invert()
        ).invert().pinch(-0.5, 1)
    ).asNumeric();
    if (debug?.is('map', 'l')) return new DebugMap(landMap);

    let waterMap = landMap.copy().invert().threshold(0.5).blur(0.35).boolThreshold(0.5);
    if (debug?.is('map', 'w')) return new DebugMap(waterMap);

    let fairwayValMap = region.product(
        region.product(
            region.tile(NumericFunction2D.offsetSum(0.5,
                mB.buildWarpNoiseMap(10, 8, 3)
            )),
            landMap.copy().multiply(0.85).add(0.125).clamp()
        ).invert(),
        // endsMap.copy().scale(3.5, 1).clamp().invert()
    ).invert();
    if (debug?.is('map', 'f')) return new DebugMap(fairwayValMap);
    let fairwayFn = fairwayValMap.boolThreshold(0.5);

    let rockValMap = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(25).multiply(0, 0.5),
            mB.buildWarpNoiseMap(12, 12, 6),
        )),
        landMap.copy().add(0.25).clamp(),
        // pathMap.copy().pinch(-0.2, 1, 0.2).clamp().scale(0.8).invert(),
        // endsMap.copy().scale(2, 1).clamp().invert()
    );
    if (debug?.is('map', 'r')) return new DebugMap(!debug?.get('m') ? rockValMap : landMap.copy().add(0.25).clamp());
    let rockMap = rockValMap.copy().threshold(0.665).blur(0.5).boolThreshold(0.4);

    let sandValMap = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(10).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(4.5, 8, 4).multiply(1, 0.5),
        )),
        landMap.copy().invert().multiply(4).add(0.25).clamp(),
        // pathMap.copy().pinch(0.5, 1).clamp().scale(0.5).invert(),
    ).threshold(0.58).blur(2);
    // if (debug?.is('map', 's')) return new DebugMap(!debug?.get('m')?sandMapV.inner:pathMap.copy().pinch(0.5, 1).clamp().scale(0.5).invert().inner);
    let sandMap = sandValMap.boolThreshold(0.4);

    let treeValFn = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildWarpNoiseMap(10, 15, 2.5).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(7, 10, 2).multiply(0.5, 0.5),
            mB.buildWarpNoiseMap(3, 8, 2).multiply(1, 0.5)
        )),
        landMap.copy().multiply(1.5).add(0.225).clamp(),
        // endsMap.copy().scale(2, 1).clamp().invert(),
        fairwayValMap.copy().multiply(3, 1).clamp().invert(),
        sandValMap.copy().multiply(1.5, 1).clamp().invert(),
    );
    if (debug?.is('map', 't')) return new DebugMap(treeValFn);
    let treeMap = treeValFn.boolThreshold(0.65);

    return region.tile(p => {
        if (p.equals(holePos)) {
            return CellType.Hole;
        }
        switch (true) {
            case waterMap.get(p):
                return CellType.Water;
            case rockMap.get(p):
                return CellType.Rock;
            case treeMap.get(p):
                return CellType.Tree;
            case sandMap.get(p):
                return CellType.Sand;
            case fairwayFn.get(p):
                return CellType.Fairway;
            default:
                return CellType.Rough;
        }
    });
}

export function generateTerrain(width: number, height: number, xEdge: number, yEdge: number, teePos: RectPoint2D, holePos: RectPoint2D, rng: Random): RectTiling2D<CellType> {
    let maybeTerrain = generateTerrainDebug(width, height, xEdge, yEdge, teePos, holePos, rng);
    if (maybeTerrain instanceof DebugMap) {
        throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");
    }
    return maybeTerrain;
}