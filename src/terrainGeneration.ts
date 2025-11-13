import {MersenneTwister19937, Random} from "random-js";
import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {CellType} from "./course";
import gaussian from "gaussian";
import {
    HexRegion,
    type Region,
    type Point,
    RectDirection,
    RectRegion,
    RectPoint,
    TiledHexRegion,
    type TiledRegion,
    TiledRectRegion
} from "./geometry";

export class ValMapBuilder {
    readonly plane: Region;
    #rng: Random;
    #globalScale: number = 1;

    constructor(plane: Region, rng: Random) {
        this.plane = plane;
        this.#rng = rng;
    }

    fromTiledPlane(tiledPlane: TiledRegion<number>): TerrainMap {
        if (!this.plane.equals(tiledPlane.bounds)) {
            throw new Error("Dimensions do not match.");
        }
        return new TerrainMap(tiledPlane);
    }

    setGlobalNoiseScale(scale: number) {
        this.#globalScale = scale;
    }

    buildMap(fn: (p: Point) => number): TerrainMap {
        return new TerrainMap(this.plane.tilingBuild(fn));
    }

    buildNoiseMap(scale: number) {
        let noise = new Noise2D(scale*this.#globalScale, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap(p => 0.5*noise.get(p) + 0.5);
    }

    buildWarpNoiseMap(scale: number, warpScale: number, warpAmount: number) {
        let noise = new WarpNoise2D(scale*this.#globalScale, warpScale*this.#globalScale, warpAmount/this.#globalScale, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap(p => 0.5*noise.get(p) + 0.5);
    }

    buildLoopyNoiseMap(scale: number, warpAmount: number, warpVarianceScale: number, warpVariance: number, loopScale: number, loopiness: number) {
        let noise = new LoopyNoise2D(scale*this.#globalScale, warpAmount/this.#globalScale, warpVarianceScale*this.#globalScale, warpVariance/this.#globalScale, loopScale*this.#globalScale, loopiness, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap(p => 0.5*noise.get(p) + 0.5);
    }

    sum(center: number, ...maps: TerrainMap[]): TerrainMap {
        return this.buildMap(p => {
            return maps.reduce((s, m) => s + m.get(p) - center, center);
        });
    }

    prod(...maps: TerrainMap[]): TerrainMap {
        return this.buildMap(p => {
            return maps.reduce((s, m) => s * m.get(p), 1);
        });
    }
}

export class TerrainMap {
    inner: TiledRegion<number>;

    constructor(map: TiledRegion<number>) {
        this.inner = map;
    }

    apply(fn: (v: number) => number) {
        this.inner.mapInPlace(v => fn(v));
        return this;
    }

    shift(amount: number) {
        this.inner.mapInPlace(v => v + amount);
        return this;
    }

    scale(factor: number, center?: number) {
        center = center ?? 0;
        this.inner.mapInPlace(v => center + (v-center) * factor);
        return this;
    }

    pinch(amount: number, center?: number, range?: number) {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        this.inner.mapInPlace(v => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            return center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        })
        return this;
    }

    blur(sigma: number) {
        if (this.inner instanceof TiledRectRegion) {
            this.inner = rectGaussianBlur(this.inner, sigma);
        } else if (this.inner instanceof TiledHexRegion) {
            this.inner = hexGaussianBlur(this.inner, sigma);
        } else {
            throw new Error("Unsupported TiledPlane for blur().");
        }
        return this;
    }

    invert() {
        this.inner.mapInPlace(v => 1-v);
        return this;
    }

    clamp(low?: number, high?: number) {
        low = low??0;
        high = high??1;
        this.inner.mapInPlace(v => Math.min(high, Math.max(low, v)));
        return this;
    }

    copy() {
        return new TerrainMap(this.inner.copy());
    }

    get(point: Point) {
        return this.inner.get(point);
    }

    threshold(value:number) {
        this.inner.mapInPlace(v => v >= value ? 1 : 0);
        return this;
    }

    boolThreshold(value: number): TiledRegion<boolean> {
        return this.inner.map(v => v >= value);
    }
}

export class Noise2D {
    #noise: NoiseFunction2D;
    #scale: number;
    #offsetX: number;
    #offsetY: number;

    constructor(scale: number, rng: Random) {
        this.#noise = createNoise2D(() => rng.real(0, 1));
        this.#scale = scale;
        this.#offsetX = rng.real(0, 1);
        this.#offsetY = rng.real(0, 1);
    }

    get(point: Point) {
        const p = point.toRect();
        return this.#noise(p.x/this.#scale + this.#offsetX, p.y/this.#scale + this.#offsetY);
    }
}

export class WarpNoise2D {
    #noise: Noise2D;
    #warpX: Noise2D;
    #warpY: Noise2D;
    #warpAmount: number;


    constructor(scale: number, warpScale: number, warpAmount: number, rng: Random) {
        this.#warpAmount = warpAmount;
        this.#noise = new Noise2D(scale, rng);
        this.#warpX = new Noise2D(warpScale, rng);
        this.#warpY = new Noise2D(warpScale, rng);
    }

    get(point: Point) {
        const warp = new RectPoint(
            this.#warpAmount*this.#warpX.get(point),
            this.#warpAmount*this.#warpY.get(point),
        );
        return this.#noise.get(point.add(warp));
    }
}


export class LoopyNoise2D {
    #noise: Noise2D;
    #warpAngle: Noise2D;
    #warpVariance: Noise2D;
    #warpVarianceAmount: number;
    #warpAmount: number;
    #angleAmount: number;


    constructor(scale: number, warpAmount: number, warpVarianceScale: number, warpVariance: number, loopScale: number, loopiness: number, rng: Random) {
        this.#warpAmount = warpAmount;
        this.#noise = new Noise2D(scale, rng);
        this.#warpAngle = new Noise2D(loopScale, rng);
        this.#warpVariance = new Noise2D(warpVarianceScale, rng);
        this.#warpVarianceAmount = warpVariance;
        this.#angleAmount = loopiness*loopScale;
    }

    get(point: Point) {
        const tau = 2*Math.PI;
        let angle = this.#angleAmount * this.#warpAngle.get(point) * tau; // Radians
        angle = ((angle % tau) + tau) % tau;
        let magnitude = this.#warpAmount + this.#warpVarianceAmount * this.#warpVariance.get(point);
        let warp: RectPoint;
        if (angle < 0.25*tau) {
            warp = new RectPoint(
                magnitude*Math.cos(angle),
                magnitude*Math.sin(angle),
            );
        } else if (angle < 0.5*tau) {
            warp = new RectPoint(
                -magnitude*Math.sin(angle-0.25*tau),
                magnitude*Math.cos(angle-0.25*tau),
            );
        } else if (angle < 0.75*tau) {
            warp = new RectPoint(
                -magnitude*Math.cos(angle-0.5*tau),
                -magnitude*Math.sin(angle-0.5*tau),
            );
        } else {
            warp = new RectPoint(
                magnitude*Math.sin(angle-0.75*tau),
                -magnitude*Math.cos(angle-0.75*tau),
            );
        }
        Math.tan(angle);
        return this.#noise.get(point.add(warp));
    }
}

export function loopErasedRandomWalk(walls: TiledRectRegion<boolean>, start: RectPoint, end: RectPoint, rng: Random): RectPoint[] {
    let markDelay = 1;
    function positionHash(pos: RectPoint) { return pos.x + ',' + pos.y; }
    let startHash = positionHash(start);
    let path: {position: RectPoint, markedRegion: string[]}[] = [{position: start, markedRegion: [startHash]}];
    let markedCells: Set<string> = new Set([startHash]);
    let currentPosition: RectPoint = start;
    function pathPop() {
        const removed = path.pop() as {position: RectPoint; markedRegion: string[]};
        for (const markedHash of removed.markedRegion) {
            markedCells.delete(markedHash);
        }
    }
    function isOutOfBounds(p: RectPoint): boolean {
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
                        let cellToMark: RectPoint = delayedStep.position.add(new RectPoint(x, y));
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

export function rectGaussianBlur(matrix: TiledRectRegion<number>, sigma: number): TiledRectRegion<number> {
    if (sigma === 0) return matrix.copy();
    const distribution = gaussian(0, sigma);
    let gaussianValues = [distribution.cdf(0.5)-distribution.cdf(-0.5)];
    let energyCovered = gaussianValues[0];
    let valuesWidth = 0;
    while (energyCovered < 0.9) {
        let nextValue = distribution.cdf(valuesWidth+1.5) - distribution.cdf(valuesWidth+0.5);
        gaussianValues.push(nextValue);
        gaussianValues.unshift(nextValue);
        energyCovered += 2*nextValue;
        valuesWidth++;
    }

    function blurRowsIntoInverted(width: number, height: number, input: number[][]): number[][] {
        let result = Array(height).fill(null).map(() => Array(width).fill(0));
        input.forEach((col, x) => {
            for (let y = 0; y < col.length; y++) {
                let val = 0;
                let max = 0;
                for (let i = -valuesWidth; i <= valuesWidth; i++) {
                    max += (col[y + i] !== undefined) ? gaussianValues[i+ valuesWidth] : 0;
                    val += (col[y + i] ?? 0) * gaussianValues[i+valuesWidth];
                }
                result[y][x] = max === 0 ? 0 : val / max;
            }
        });
        return result;
    }
    let xBlurredInverted: number[][] = blurRowsIntoInverted(matrix.bounds.width, matrix.bounds.height, matrix.data);
    let blurred: number[][] = blurRowsIntoInverted(matrix.bounds.height, matrix.bounds.width, xBlurredInverted);
    return new TiledRectRegion(matrix.bounds, blurred);
}

function hexGaussianBlur(tiling: TiledHexRegion<number>, sigma: number): TiledHexRegion<number> {
    const maxDist = 3*sigma;
    const minL = Math.ceil(-maxDist);
    const maxL = Math.ceil(maxDist);
    const plane = new HexRegion(minL, maxL, minL, maxL, minL, maxL);
    const distribution = gaussian(0, sigma);
    let kernel = plane.tilingBuild(p => {
        let dist = p.magnitude();
        return distribution.cdf(dist + 0.5) - distribution.cdf(dist - 0.5);
    });

    let result = tiling.bounds.tilingOf(0);
    tiling.forEach((value, p) => {
        if (value == 0) {
            return;
        }
        const localKernel = kernel.map((kValue, kP) => tiling.bounds.contains(p.add(kP)) ? kValue : 0);
        let kernelSum = 0;
        localKernel.forEach(kValue => kernelSum += kValue);
        localKernel.forEach((kValue, kP) => {
            if (kValue == 0) {
                return;
            }
            const target = p.add(kP);
            result.set(target, result.get(target) + value*kValue/kernelSum);
        })
    });

    return result;
}

export function generateTeeAndHolePos(width: number, height: number, xEdge: number, yEdge: number, rng: Random): [RectPoint, RectPoint] {
    const positionLimit = 0.4;

    const positionRng = new Random(MersenneTwister19937.seed(rng.uint32()));
    function generatePosition(longSide: number, shortSide: number, longEdge: number, shortEdge: number, longLimit: number): [number, number] {
        let posLong = positionRng.integer(longEdge, (longSide - 2*longEdge) * Math.abs(longLimit) - 1);
        if (longLimit < 0) {
            posLong = longSide - posLong - 1;
        }
        return [posLong, positionRng.integer(shortEdge, shortSide - 2*shortEdge - 1)]
    }
    let holePos: RectPoint, teePos: RectPoint;
    let teeAtTop = positionRng.pick([-1, 1]);
    if (width > height) {
        let [x, y] = generatePosition(width, height, xEdge, yEdge, -teeAtTop*positionLimit);
        teePos = new RectPoint(x, y);
        [x, y] = generatePosition(width, height, xEdge, yEdge, teeAtTop*positionLimit);
        holePos = new RectPoint(x, y);
    } else {
        let [y, x] = generatePosition(height, width, yEdge, xEdge, -teeAtTop*positionLimit);
        teePos = new RectPoint(x, y);
        [y, x] = generatePosition(height, width, yEdge, xEdge, teeAtTop*positionLimit);
        holePos = new RectPoint(x, y);
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

export class DebugMap {
    map: TiledRegion<number|boolean>;

    constructor(map: TiledRegion<number|boolean>) {
        this.map = map;
    }
}

export function generateTerrainDebug(width: number, height: number, xEdge: number, yEdge: number, teePos: RectPoint, holePos: RectPoint, rng: Random, debug?: TerrainDebugSettings): TiledRectRegion<CellType> | DebugMap {
    const plane = new RectRegion(width, height);
    let mB = new ValMapBuilder(plane, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03).inner);

    let edgeProximityMap = mB.buildMap(p => {
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
    });
    if (debug?.is('map', 'edge')) return new DebugMap(edgeProximityMap.inner);


    let center: RectPoint = new RectPoint(Math.round((teePos.x + holePos.x)/2), Math.round((teePos.y + holePos.y)/2));
    let distance = teePos.sub(holePos).magnitude();
    let radius = Math.min(Math.min(width-2*xEdge, height-2*yEdge) / 6, distance/2-1.5);
    let walls = plane.tilingBuild(p => {
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

    let rawPathMap = plane.tilingOf(0);
    for (const pos of path) {
        rawPathMap.set(pos, 1);
    }
    let pathMap = mB.fromTiledPlane(rawPathMap.copy());

    let endsTiling = plane.tilingOf(0);
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (endsTiling.data[holePos.x+offset[0]][holePos.y+offset[1]] !== undefined)
            endsTiling.data[holePos.x+offset[0]][holePos.y+offset[1]] = 0.65;
    }
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (endsTiling.data[teePos.x+offset[0]][teePos.y+offset[1]] === 0)
            endsTiling.data[teePos.x+offset[0]][teePos.y+offset[1]] = 0.45;
    }
    let endWeights = [1.5, 1, 0.85, 0.7, 0.5, 0.3];
    endWeights.forEach((weight, i) => {
        let stepFromStart = path[i];
        if (stepFromStart !== undefined) {
            endsTiling.data[stepFromStart.x][stepFromStart.y] += weight;
        }
        let stepFromEnd = path[path.length - 1 - i];
        if (stepFromEnd !== undefined) {
            endsTiling.data[stepFromEnd.x][stepFromEnd.y] += weight;
        }
    })
    let endsMap = mB.fromTiledPlane(endsTiling);

    pathMap.blur(1.7).scale(3).clamp();
    endsMap.blur(1.7).scale(4.5).clamp();

    if (debug?.is('map', 'path')) return new DebugMap(!debug?.get('m') ? pathMap.inner: rawPathMap);
    if (debug?.is('map', 'pathEnds')) return new DebugMap(endsMap.inner);

    let landMap = mB.prod(
        mB.prod(
            mB.buildWarpNoiseMap(7, 8, 2.5),
            edgeProximityMap.copy().pinch(0.2, 1),
        ).invert(),
        endsMap.copy().invert(),
        pathMap.copy().scale(0.08).invert()
    ).invert().pinch(-0.5, 1);
    if (debug?.is('map', 'l')) return new DebugMap(landMap.inner);

    let waterMap = landMap.copy().invert().threshold(0.5).blur(0.35).boolThreshold(0.5);
    if (debug?.is('map', 'w')) return new DebugMap(waterMap);

    let fairwayMapV = mB.prod(
        mB.prod(
            mB.sum(0.5,
                mB.buildWarpNoiseMap(10, 8, 3)
            ),
            landMap.copy().scale(0.85).shift(0.125).clamp()
        ).invert(),
        endsMap.copy().scale(3.5, 1).clamp().invert()
    ).invert();
    if (debug?.is('map', 'f')) return new DebugMap(fairwayMapV.inner);
    let fairwayMap = fairwayMapV.boolThreshold(0.5);

    let rockMapV = mB.prod(
        mB.sum(0.5,
            mB.buildNoiseMap(25).scale(0, 0.5),
            mB.buildWarpNoiseMap(12, 12, 6),
        ),
        landMap.copy().shift(0.25).clamp(),
        pathMap.copy().pinch(-0.2, 1, 0.2).clamp().scale(0.8).invert(),
        endsMap.copy().scale(2, 1).clamp().invert()
    );
    if (debug?.is('map', 'r')) return new DebugMap(!debug?.get('m') ? rockMapV.inner : landMap.copy().shift(0.25).clamp().inner);
    let rockMap = rockMapV.threshold(0.665).blur(0.5).boolThreshold(0.4);

    let sandMapV = mB.prod(
        mB.sum(0.5,
            mB.buildNoiseMap(10).scale(0.15, 0.5),
            mB.buildWarpNoiseMap(4.5, 8, 4).scale(1, 0.5),
        ),
        landMap.copy().invert().scale(4).shift(0.25).clamp(),
        pathMap.copy().pinch(0.5, 1).clamp().scale(0.5).invert(),
    ).threshold(0.58).blur(2);
    if (debug?.is('map', 's')) return new DebugMap(!debug?.get('m')?sandMapV.inner:pathMap.copy().pinch(0.5, 1).clamp().scale(0.5).invert().inner);
    let sandMap = sandMapV.boolThreshold(0.4);

    let treeMapV = mB.prod(
        mB.sum(0.5,
            mB.buildWarpNoiseMap(10, 15, 2.5).scale(0.15, 0.5),
            mB.buildWarpNoiseMap(7, 10, 2).scale(0.5, 0.5),
            mB.buildWarpNoiseMap(3, 8, 2).scale(1, 0.5)
        ),
        landMap.copy().scale(1.5).shift(0.225).clamp(),
        endsMap.copy().scale(2, 1).clamp().invert(),
        fairwayMapV.copy().scale(3, 1).clamp().invert(),
        sandMapV.copy().scale(1.5, 1).clamp().invert(),
    );
    if (debug?.is('map', 't')) return new DebugMap(treeMapV.inner);
    let treeMap = treeMapV.boolThreshold(0.65);

    return plane.tilingBuild(p => {
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

export function generateTerrain(width: number, height: number, xEdge: number, yEdge: number, teePos: RectPoint, holePos: RectPoint, rng: Random): TiledRectRegion<CellType> {
    let maybeTerrain = generateTerrainDebug(width, height, xEdge, yEdge, teePos, holePos, rng);
    if (maybeTerrain instanceof DebugMap) {
        throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");
    }
    return maybeTerrain;
}