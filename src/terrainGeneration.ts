import {MersenneTwister19937, Random} from "random-js";
import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {CellType, Direction, moveInDirection, type Position} from "./course";

export function buildMap<T>(width: number, height: number, fn: (x:number, y:number) => T): T[][] {
    let result = [];
    for (let x = 0; x < width; x++) {
        let col = [];
        for (let y = 0; y < height; y++) {
            col.push(fn(x, y));
        }
        result.push(col);
    }
    return result;
}

export class ValMapBuilder {
    #width: number;
    #height: number;
    #rng: Random;
    #globalScale: number = 1;

    constructor(width: number, height: number, rng: Random) {
        this.#width = width;
        this.#height = height;
        this.#rng = rng;
    }

    setGlobalNoiseScale(scale: number) {
        this.#globalScale = scale;
    }

    buildNoiseMap(scale: number) {
        let noise = new Noise2D(scale*this.#globalScale, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap((x, y) => noise.get(x, y));
    }

    buildWarpNoiseMap(scale: number, warpScale: number, warpAmount: number) {
        let noise = new WarpNoise2D(scale*this.#globalScale, warpScale*this.#globalScale, warpAmount/this.#globalScale, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap((x, y) => noise.get(x, y));
    }

    buildLoopyNoiseMap(scale: number, warpAmount: number, warpVarianceScale: number, warpVariance: number, loopScale: number, loopiness: number) {
        let noise = new LoopyNoise2D(scale*this.#globalScale, warpAmount/this.#globalScale, warpVarianceScale*this.#globalScale, warpVariance/this.#globalScale, loopScale*this.#globalScale, loopiness, new Random(MersenneTwister19937.seed(this.#rng.uint32())));
        return this.buildMap((x, y) => noise.get(x, y));
    }

    buildMap(fn: (x:number, y:number) => number): ValMap {
        return new ValMap(buildMap(this.#width, this.#height, fn));
    }

    sum(...maps: ValMap[]): ValMap {
        return this.buildMap((x, y) => {
            return maps.reduce((s, m) => s + m.get(x, y), 0);
        });
    }

    prod01(...maps: ValMap[]): ValMap {
        return this.buildMap((x, y) => {
            return 2*maps.reduce((s, m) => s * (0.5*m.get(x, y) + 0.5), 1) - 1;
        });
    }
}

export class ValMap {
    #map: number[][];

    constructor(map: number[][]) {
        this.#map = map;
    }

    apply(fn: (v: number) => number) {
        this.#map.forEach(col => col.forEach((v, i) => col[i] = fn(v)));
        return this;
    }

    shift(amount: number) {
        this.#map.forEach(col => col.forEach((v, i) => col[i] = v + amount));
        return this;
    }

    scale(factor: number, center?: number) {
        center = center ?? 0;
        this.#map.forEach(col => col.forEach((v, i) => col[i] = center + (v-center) * factor));
        return this;
    }

    pinch(amount: number, center?: number, range?: number) {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        this.#map.forEach(col => col.forEach((v, i) => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            col[i] = center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        }));
        return this;
    }

    invert() {
        this.#map.forEach(col => col.forEach((v, i) => col[i] = -v));
        return this;
    }

    clamp(low?: number, high?: number) {
        low = low??-1;
        high = high??1;
        this.#map.forEach(col => col.forEach((v, i) => col[i] = Math.min(high, Math.max(low, v))));
        return this;
    }

    copy() {
        return new ValMap(this.#map.map(col => col.slice()));
    }

    get(x: number, y: number) {
        return this.#map[x][y];
    }

    threshold(value: number) {
        return this.#map.map(col => col.map(v => v >= value));
    }

    toArray() {
        return this.#map.slice();
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

    get(x: number, y: number) {
        return this.#noise(x/this.#scale + this.#offsetX, y/this.#scale + this.#offsetY);
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

    get(x: number, y: number) {
        let xWarp = this.#warpAmount*this.#warpX.get(x, y);
        let yWarp = this.#warpAmount*this.#warpY.get(x, y);
        return this.#noise.get(x + xWarp, y + yWarp);
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

    get(x: number, y: number) {
        const tau = 2*Math.PI;
        let angle = this.#angleAmount * this.#warpAngle.get(x, y) * tau; // Radians
        angle = ((angle % tau) + tau) % tau;
        let magnitude = this.#warpAmount + this.#warpVarianceAmount * this.#warpVariance.get(x, y);
        let xWarp:number, yWarp:number;
        if (angle < 0.25*tau) {
            yWarp = magnitude*Math.sin(angle);
            xWarp = magnitude*Math.cos(angle);
        } else if (angle < 0.5*tau) {
            yWarp = magnitude*Math.cos(angle-0.25*tau);
            xWarp = -magnitude*Math.sin(angle-0.25*tau);
        } else if (angle < 0.75*tau) {
            yWarp = -magnitude*Math.sin(angle-0.5*tau);
            xWarp = -magnitude*Math.cos(angle-0.5*tau);
        } else {
            yWarp = -magnitude*Math.cos(angle-0.75*tau);
            xWarp = magnitude*Math.sin(angle-0.75*tau);
        }
        Math.tan(angle);
        return this.#noise.get(x + xWarp, y + yWarp);
    }
}

export function loopErasedRandomWalk(width: number, height: number, start: Position, end: Position, rng: Random) {
    let markDelay = 1;
    function positionHash(pos: Position) { return pos[0] + ',' + pos[1]; }
    let startHash = positionHash(start);
    let path: {position: Position, markedRegion: string[]}[] = [{position: start, markedRegion: [startHash]}];
    let markedCells: Set<string> = new Set([startHash]);
    let currentPosition: Position = start;
    function pathPop() {
        const removed = path.pop() as {position: Position; markedRegion: string[]};
        for (const markedHash of removed.markedRegion) {
            markedCells.delete(markedHash);
        }
    }
    while (true) {
        while (true) {
            let nextDirection: Direction = rng.integer(0, 7);
            let nextPosition = moveInDirection(currentPosition, nextDirection);
            if (nextPosition[0] < 0 || nextPosition[0] >= width || nextPosition[1] < 0 || nextPosition[1] >= height) {
                // If path goes off edge, step back 2 steps. (Not required, but makes path avoid edge)
                for (let i = 0; i < Math.min(2, path.length - 1); i++) {
                    pathPop();
                }
                currentPosition = path[path.length-1].position;
                continue;
            }
            if (nextPosition[0] === end[0] && nextPosition[1] === end[1]) {
                path.push({position: end, markedRegion: []});
                return path.map(step => step.position);
            }
            // Disallow corners because it can get stuck in corners.
            let edgeX = nextPosition[0] === 0 || nextPosition[0] === width - 1;
            let edgeY = nextPosition[1] === 0 || nextPosition[1] === height - 1;
            if (edgeX && edgeY) {
                continue;
            }
            let nextPositionHash = positionHash(nextPosition);
            if (markedCells.has(nextPositionHash)) {
                let found = false;
                while (!found) {
                    if (path.length === 0) {
                        throw new Error("Path is empty!");
                    }
                    let lastStep = path[path.length - 1];
                    if (lastStep.markedRegion.includes(nextPositionHash)) {
                        if (lastStep.position[0] === nextPosition[0] && lastStep.position[1] === nextPosition[1]) {
                            currentPosition = lastStep.position;
                        } else {
                            for (let i = 0; i < markDelay; i++) {
                                pathPop();
                            }
                            currentPosition = path[path.length-1].position;
                        }
                        found = true;
                    } else {
                        pathPop();
                    }
                }
                continue;
            }


            let nextMarked = [positionHash(nextPosition)];

            let delayedStep = path[path.length-1-markDelay];
            if (delayedStep !== undefined) {
                for (let y = -1; y < 2; y++) {
                    for (let x = -1; x < 2; x++) {
                        let cellToMark: Position = [delayedStep.position[0] + x, delayedStep.position[1] + y];
                        if (cellToMark[0] === end[0] && cellToMark[1] === end[1]) {
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

            break;
        }
    }
}

export function gaussianBlur(width: number, height: number, item: number[][]): number[][] {
    let blurVector2 = [0.0158, 0.0514, 0.1191, 0.1971, 0.2332, 0.1971, 0.1191, 0.0514, 0.0158];
    function blurRowsIntoInverted(width: number, height: number, input: number[][]): number[][] {
        let result = Array(height).fill(null).map(() => Array(width).fill(0));
        input.forEach((col, x) => {
            for (let y = 0; y < col.length; y++) {
                let val = 0;
                for (let i = -4; i < 5; i++) {
                    val += (col[y + i] ?? 0) * blurVector2[i+4];
                }
                result[y][x] = val;
            }
        });
        return result;
    }
    let xBlurredInverted: number[][] = blurRowsIntoInverted(width, height, item);
    let blurred: number[][] = blurRowsIntoInverted(height, width, xBlurredInverted);
    return blurred;
}

export function gaussianBlurSmall(width: number, height: number, item: number[][]): number[][] {
    let blurVector2 = [0.0002,0.0060,0.0606,0.2417,0.3829,0.2417,0.0606,0.0060,0.0002];
    function blurRowsIntoInverted(width: number, height: number, input: number[][]): number[][] {
        let result = Array(height).fill(null).map(() => Array(width).fill(0));
        input.forEach((col, x) => {
            for (let y = 0; y < col.length; y++) {
                let val = 0;
                for (let i = -4; i < 5; i++) {
                    val += (col[y + i] ?? 0) * blurVector2[i+4];
                }
                result[y][x] = val;
            }
        });
        return result;
    }
    let xBlurredInverted: number[][] = blurRowsIntoInverted(width, height, item);
    let blurred: number[][] = blurRowsIntoInverted(height, width, xBlurredInverted);
    return blurred;
}

export function generateTeeAndHolePos(width: number, height: number, rng: Random): [Position, Position] {
    const positionLimit = 0.25;
    const edgeSize = 1;

    const positionRng = new Random(MersenneTwister19937.seed(rng.uint32()));
    function generatePosition(longSide: number, shortSide: number, longLimit: number): [number, number] {
        let posLong = positionRng.integer(edgeSize, (longSide - 2*edgeSize) * Math.abs(longLimit) - 1);
        if (longLimit < 0) {
            posLong = longSide - posLong - 1;
        }
        return [posLong, positionRng.integer(edgeSize, shortSide - 2*edgeSize - 1)]
    }
    let holePos: Position, teePos: Position;
    let teeAtTop = positionRng.pick([-1, 1]);
    if (width > height) {
        let [x, y] = generatePosition(width, height, -teeAtTop*positionLimit);
        teePos = [x, y];
        [x, y] = generatePosition(width, height, teeAtTop*positionLimit);
        holePos = [x, y];
    } else {
        let [y, x] = generatePosition(height, width, -teeAtTop*positionLimit);
        teePos = [x, y];
        [y, x] = generatePosition(height, width, teeAtTop*positionLimit);
        holePos = [x, y];
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
            .addOption('path', 'Path')
            .addOption('pathEnds', 'Path Ends')
            .addOption('l', 'Land')
            .addOption('w', 'Water')
            .addOption('r', 'Rock')
            .addOption('f', 'Fairway')
            .addOption('t', 'Trees')
            .addOption('s', 'Sand')
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
    map: (number|boolean)[][];

    constructor(map: (number | boolean)[][]) {
        this.map = map;
    }
}

export function generateTerrainDebug(width: number, height: number, teePos: Position, holePos: Position, rng: Random, debug?: TerrainDebugSettings): CellType[][] | DebugMap {
    let path = loopErasedRandomWalk(width, height, teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

    let rawPathMap: number[][] = Array(width).fill(null).map(() => Array(height).fill(0));
    let rawEndsMap: number[][] = Array(width).fill(null).map(() => Array(height).fill(0));
    for (const pos of path) {
        rawPathMap[pos[0]][pos[1]] = 1;
    }
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (rawEndsMap[holePos[0]+offset[0]][holePos[1]+offset[1]] !== undefined)
            rawEndsMap[holePos[0]+offset[0]][holePos[1]+offset[1]] = 0.65;
    }
    for (const offset of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (rawEndsMap[teePos[0]+offset[0]][teePos[1]+offset[1]] === 0)
            rawEndsMap[teePos[0]+offset[0]][teePos[1]+offset[1]] = 0.45;
    }
    let endWeights = [1.5, 1, 0.85, 0.7, 0.5, 0.3];
    endWeights.forEach((weight, i) => {
        let stepFromStart = path[i];
        if (stepFromStart !== undefined) {
            rawEndsMap[stepFromStart[0]][stepFromStart[1]] += weight;
        }
        let stepFromEnd = path[path.length - 1 - i];
        if (stepFromEnd !== undefined) {
            rawEndsMap[stepFromEnd[0]][stepFromEnd[1]] += weight;
        }
    })

    let rawPathMapBlurred: number[][] = gaussianBlur(width, height, rawPathMap);
    let rawEndsMapBlurred: number[][] = gaussianBlur(width, height, rawEndsMap);


    let mB = new ValMapBuilder(width, height, rng);

    let pathMap = mB.buildMap((x, y) => {
        return rawPathMapBlurred[x][y] * 6 - 1;
    }).clamp();
    if (debug?.is('map', 'path')) return new DebugMap(pathMap.toArray());

    let endsMap = mB.buildMap((x, y) => {
        return rawEndsMapBlurred[x][y] * 9 - 1;
    }).clamp();
    if (debug?.is('map', 'pathEnds')) return new DebugMap(endsMap.toArray());


    let edgeProximityMap = mB.buildMap((x, y) => {
        let edgeProximity = 1;
        if (x <= 2) {
            edgeProximity *= Math.pow((x+1.5)/4.5, 0.85);
        }
        if (x >= width-3) {
            edgeProximity *= Math.pow((width - 1 - (x-1.5))/4.5, 0.85);
        }
        if (y <= 2) {
            edgeProximity *= Math.pow((y+1.5)/4.5, 0.85);
        }
        if (y >= height-3) {
            edgeProximity *= Math.pow((height - 1 - (y-1.5))/4.5, 0.85);
        }
        return 2*edgeProximity - 1;
    });
    if (debug?.is('map', 'edge')) return new DebugMap(edgeProximityMap.toArray());

    let landMap = mB.prod01(
        mB.prod01(
            mB.buildWarpNoiseMap(10, 10, 2.5),
            edgeProximityMap.copy().pinch(0.2, 1, 2),
        ).invert(),
        endsMap.copy().invert(), pathMap.copy().scale(0.08, -1).invert()
    ).invert().pinch(-0.2, 1, 2);
    if (debug?.is('map', 'l')) return new DebugMap(landMap.toArray());

    let waterMap = landMap.copy().invert().threshold(0.2);
    if (debug?.is('map', 'w')) return new DebugMap(waterMap);

    let fairwayMapV = mB.prod01(
        mB.prod01(
            mB.sum(
                mB.buildWarpNoiseMap(10, 8, 3)
            ),
            landMap.copy().scale(0.85, -1).shift(0.25).clamp()
        ).invert(),
        endsMap.copy().scale(3.5, 1).clamp().invert()
    ).invert();
    if (debug?.is('map', 'f')) return new DebugMap(fairwayMapV.toArray());
    let fairwayMap = fairwayMapV.threshold(0);

    let rockMapV = mB.prod01(
        mB.sum(
            mB.buildLoopyNoiseMap(13, 4, 10, 4, 8, 0.025).scale(1),
            mB.buildWarpNoiseMap(7, 10, 1).scale(0)
        ),
        landMap.copy().scale(1.4, -1).shift(0.4).clamp(),
        pathMap.copy().pinch(-0.2, 1, 0.4).clamp().scale(0.8, -1).invert(),
        endsMap.copy().scale(2, 1).clamp().invert()
    );
    if (debug?.is('map', 'r')) return new DebugMap(rockMapV.toArray());
    let rockMap = rockMapV.threshold(0.15);

    let treeMapV = mB.prod01(
        mB.sum(
            mB.buildWarpNoiseMap(10, 15, 2.5).scale(0.15),
            mB.buildWarpNoiseMap(7, 10, 2).scale(0.5),
            mB.buildWarpNoiseMap(3, 8, 2).scale(1)
        ),
        landMap.copy().scale(1.5, -1).shift(0.45).clamp(),
        endsMap.copy().scale(2, 1).clamp().invert(),
        fairwayMapV.copy().scale(3, 1).clamp().invert()
    );
    if (debug?.is('map', 't')) return new DebugMap(treeMapV.toArray());
    let treeMap = treeMapV.threshold(0.3);


    let sandWaterAvoidanceMap = landMap.copy().invert().scale(2, -1).shift(0.25).clamp();
    let sandMapV = mB.prod01(
        mB.sum(
            mB.buildNoiseMap(8).scale(1),
            ),
        sandWaterAvoidanceMap
    );
    if (debug?.is('map', 's')) return new DebugMap(sandMapV.toArray());
    let sandMap = sandMapV.threshold(0.45);

    return buildMap(width, height, (x, y) => {
        if (holePos[0] === x && holePos[1] === y) {
            return CellType.Hole;
        }
        switch (true) {
            case waterMap[x][y]:
                return CellType.Water;
            case rockMap[x][y]:
                return CellType.Rock;
            case treeMap[x][y]:
                return CellType.Tree;
            case sandMap[x][y]:
                return CellType.Sand;
            case fairwayMap[x][y]:
                return CellType.Fairway;
            default:
                return CellType.Rough;
        }
    });
}

export function generateTerrain(width: number, height: number, teePos: Position, holePos: Position, rng: Random): CellType[][] {
    let maybeTerrain = generateTerrainDebug(width, height, teePos, holePos, rng);
    if (maybeTerrain instanceof DebugMap) {
        throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");
    }
    return maybeTerrain;
}