import {MersenneTwister19937, Random} from "random-js";
import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {CellType} from "./course";
import {HexPoint2D, type Point2D, RectPoint2D} from "$lib/maths/point2D";
import {
    HexRegion2D,
    HexTile,
    RectRegion2D,
    RectTile,
    RectTiling2D,
    type Region2D,
    type Tile,
    type Tiling2D
} from "$lib/maths/tiling2D";
import {type Function2D, LiteralFunction2D, NumericFunction2D, NumericLiteralFunction2D} from "$lib/maths/function2D";
import {DebugMap, TerrainDebugSettings} from "$lib/terrainDebug";

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

export class LoopyWarpWithAmountMap2D<T> extends LiteralFunction2D<T> {
    #inner: Function2D<T>;
    #warpAngle: Noise2D;
    #warpVariance: Noise2D;
    #warpVarianceAmount: number;
    #warpAmount: Function2D<number>;
    #angleOffset: number;
    #angleAmount: number;

    constructor(inner: Function2D<T>, amount: Function2D<number>, varianceScale: number, variance: number, loopScale: number, loopiness: number, rng: Random) {
        super(p => {
            const tau = 2*Math.PI;
            let angle = this.#angleOffset + this.#angleAmount * this.#warpAngle.get(p) * tau; // Radians
            angle = ((angle % tau) + tau) % tau;
            let magnitude = this.#warpAmount.get(p) + this.#warpVarianceAmount * this.#warpVariance.get(p);
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
        this.#angleOffset = rng.real(0, 2*Math.PI);
    }
}

export function generateTeeAndHolePos(width: number, height: number, xEdge: number, yEdge: number, rng: Random): [RectPoint2D, RectPoint2D] {
    const positionLimit = 0.3;

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

// From https://stackoverflow.com/a/1501725
function sqr(x: number) { return x * x }
function dist2(v: RectPoint2D, w: RectPoint2D) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p: RectPoint2D, v:RectPoint2D, w:RectPoint2D) {
    let l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, new RectPoint2D(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)));
}
function distToSegment(p: Point2D, v: Point2D, w: Point2D) { return Math.sqrt(distToSegmentSquared(p.toRect(), v.toRect(), w.toRect())); }

function edgeProximityFunctionGenerator<T extends Tile>(region: Region2D<T>, edgeWidth: number): NumericFunction2D {
    if (region instanceof RectRegion2D) {
        return new NumericLiteralFunction2D(p => {
            let pR = p.toRect();
            let x = Math.max(-edgeWidth,
                pR.x - region.width + 1,
                - pR.x,
            ) + edgeWidth;
            let y = Math.max(-edgeWidth,
                pR.y - region.height + 1,
                - pR.y,
            ) + edgeWidth;
            return x + y;
        }).multiply(0.7/edgeWidth);
    } else if (region instanceof HexRegion2D) {
        return new NumericLiteralFunction2D(p => {
            let pH = p.toHex();
            let q = Math.max(-edgeWidth,
                pH.q - region.qMax + 1,
                region.qMin - pH.q,
            ) + edgeWidth;
            let r = Math.max(-edgeWidth,
                pH.r - region.rMax + 1,
                region.rMin - pH.r,
            ) + edgeWidth;
            let s = Math.max(-edgeWidth,
                pH.s - region.sMax + 1,
                region.sMin - pH.s,
            ) + edgeWidth;
            return q + r + s;
        }).multiply(0.7/edgeWidth);
    } else {
        throw new Error("Unsupported region type");
    }
}

export function generateTerrainDebug<T extends Tile>(region: Region2D<T>, edgeWidth: number, teePos: Point2D, holePos: Point2D, rng: Random, debug?: TerrainDebugSettings): Tiling2D<T, CellType> | DebugMap<T> {
    let mB = new MapBuilder(region, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(region.tile(
        mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03)
    ));

    let edgeProximityFn = edgeProximityFunctionGenerator(region, edgeWidth);
    if (debug?.is('map', 'edge')) return new DebugMap(region.tile(edgeProximityFn));

    const holeSize = 10;
    const teeSize = 10;
    let endsFn = new NumericLiteralFunction2D(p => {
        let holeProx = 1 - Math.min(holeSize, p.sub(holePos).magnitude())/holeSize;
        let teeProx = 1 - Math.min(teeSize, p.sub(teePos).magnitude())/teeSize;
        return Math.max(holeProx, teeProx);
    });
    const endsMap = region.tile(endsFn).asNumeric();
    if (debug?.is('map', 'pathEnds')) return new DebugMap(region.tile(endsFn));

    const pathWidth = 15;
    let rawPathFn = new NumericLiteralFunction2D(p => {
        return 1 - Math.min(pathWidth, distToSegment(p, holePos, teePos))/pathWidth;
    });
    const pathLoopyAmountFn = NumericFunction2D.product(
        endsFn.invert().clamp(),
        edgeProximityFn.invert().clamp(),
    ).multiply(15);
    let pathFn = new LoopyWarpWithAmountMap2D(rawPathFn, pathLoopyAmountFn, 5, 0, 40, 0.015, mB.nextRng()).asNumeric();
    const pathMap = region.tile(pathFn).asNumeric();
    if (debug?.is('map', 'path')) return new DebugMap(region.tile(
        !debug?.get('m')
            ? !debug?.get('n') ? pathFn : pathLoopyAmountFn.multiply(1/10)
            : rawPathFn
    ));

    let landMap = region.tile(
        NumericFunction2D.product(
            NumericFunction2D.product(
                mB.buildWarpNoiseMap(18, 8, 2.5),
                edgeProximityFn.invert().pinch(0.2, 1),
            ).multiply(0.5).invert(),
            // endsFn.invert(),
            pathFn.multiply(0.58).invert()
        ).invert().pinch(-0.5, 1)
    ).asNumeric();
    if (debug?.is('map', 'l')) return new DebugMap(landMap);

    let waterMap = landMap.copy().invert().threshold(0.5).blur(0.35).boolThreshold(0.5);
    if (debug?.is('map', 'w')) return new DebugMap(waterMap);

    let fairwayValMap = region.product(
        region.product(
            region.tile(NumericFunction2D.offsetSum(0.5,
                mB.buildWarpNoiseMap(15, 8, 3)
            )),
            landMap.copy().multiply(0.8, 1).clamp(),
        ).invert(),
        endsMap.copy().multiply(3, 1).clamp().invert(),
        pathMap.copy().pinch(-0.5, 1, 0.1).clamp().multiply(0.5).invert()
    ).invert();
    if (debug?.is('map', 'f')) return new DebugMap(fairwayValMap);
    let fairwayFn = fairwayValMap.boolThreshold(0.5);

    let rockValMap = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(37).multiply(0, 0.5),
            mB.buildWarpNoiseMap(18, 12, 6),
        )),
        landMap.copy().add(0.25).clamp(),
        pathMap.copy().pinch(-0.5, 1, 0.3).clamp().multiply(0.8).invert(),
        endsMap.copy().multiply(2, 1).clamp().invert()
    );
    if (debug?.is('map', 'r')) return new DebugMap(
        !debug?.get('m')
            ? !debug?.get('n') ? rockValMap : pathMap.copy().pinch(-0.5, 1, 0.3).clamp().multiply(0.8).invert()
            : landMap.copy().add(0.25).clamp()
    );
    let rockMap = rockValMap.copy().threshold(0.5).blur(0.5).boolThreshold(0.4);

    let sandValMap = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildNoiseMap(15).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(7, 8, 4).multiply(1, 0.5),
        )),
        landMap.copy().invert().multiply(4).add(0.25).clamp(),
        pathMap.copy().pinch(0.5, 1).clamp().multiply(0.5).invert(),
    ).threshold(0.58).blur(2);
    // if (debug?.is('map', 's')) return new DebugMap(!debug?.get('m')?sandMapV.inner:pathMap.copy().pinch(0.5, 1).clamp().scale(0.5).invert().inner);
    let sandMap = sandValMap.boolThreshold(0.4);

    let treeValFn = region.product(
        region.tile(NumericFunction2D.offsetSum(0.5,
            mB.buildWarpNoiseMap(15, 15, 2.5).multiply(0.15, 0.5),
            mB.buildWarpNoiseMap(11, 10, 2).multiply(0.5, 0.5),
            mB.buildWarpNoiseMap(4.5, 8, 2).multiply(1, 0.5)
        )),
        landMap.copy().multiply(1.5).add(0.225).clamp(),
        endsMap.copy().multiply(2, 1).clamp().invert(),
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

export function generateHexTerrainDebug(size: number, teePos: HexPoint2D, holePos: HexPoint2D, rng: Random, debug?: TerrainDebugSettings): Tiling2D<HexTile, CellType> | DebugMap<HexTile> {
    const region = new HexRegion2D(-size + 1, size, -size + 1, size, -size + 1, size);
    return generateTerrainDebug(region, 0.25*size, teePos, holePos, rng, debug);
}

export function generateRectTerrainDebug(width: number, height: number, teePos: RectPoint2D, holePos: RectPoint2D, rng: Random, debug?: TerrainDebugSettings): Tiling2D<RectTile, CellType> | DebugMap<RectTile> {
    const region = new RectRegion2D(width, height);
    return generateTerrainDebug(region, 0.2*Math.min(width, height), teePos, holePos, rng, debug);
}

export function generateTerrain(width: number, height: number, teePos: RectPoint2D, holePos: RectPoint2D, rng: Random): RectTiling2D<CellType> {
    const region = new RectRegion2D(width, height);
    let maybeTerrain = generateTerrainDebug(region, 0.2*Math.min(width, height), teePos, holePos, rng);
    if (maybeTerrain instanceof DebugMap) {
        throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");
    }
    return maybeTerrain as RectTiling2D<CellType>; // TODO Remove need for cast
}