import {MersenneTwister19937, Random} from "random-js";
import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {CellType, Hole} from "$lib/hole";
import {HexPoint2D, type Point2D, RectPoint2D} from "$lib/maths/point2D";
import {HexRegion2D, RectRegion2D, type Region2D} from "$lib/maths/tiling2D";
import {type Function2D, NumericFunction2D, NumericLiteralFunction2D} from "$lib/maths/function2D";
import {DebugMap, TerrainDebugSettings} from "$lib/terrainDebug";
import {aStar, fMinus} from "$lib/aStarPathfinding";

export class MapBuilder<R extends Region2D> {
    readonly region: R;
    #rng: Random;
    #globalScale: number = 1;

    constructor(plane: R, rng: Random) {
        this.region = plane;
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
        const noiseWarpTransform = new NoiseWarpTransform(
            warpScale*this.#globalScale, warpAmount/this.#globalScale, this.nextRng()
        );
        return new Noise2D(scale*this.#globalScale, this.nextRng()).multiply(0.5, 1)
            .mapInput(p => noiseWarpTransform.transformPoint(p));
    }

    buildLoopyNoiseMap(scale: number, warpAmount: number, warpVarianceScale: number, warpVariance: number, loopScale: number, loopiness: number): NumericFunction2D {

        const loopyWarpTransform = new LoopyWarpTransform(
            warpAmount/this.#globalScale, warpVarianceScale*this.#globalScale, warpVariance/this.#globalScale, loopScale*this.#globalScale, loopiness, this.nextRng()
        );
        return new Noise2D(scale*this.#globalScale, this.nextRng()).multiply(0.5, 1)
            .mapInput(p => loopyWarpTransform.transformPoint(p));
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

export class NoiseWarpTransform  {
    #warpX: Noise2D;
    #warpY: Noise2D;
    #warpAmount: number;

    constructor(scale: number, amount: number, rng: Random) {
        this.#warpAmount = amount;
        this.#warpX = new Noise2D(scale, rng);
        this.#warpY = new Noise2D(scale, rng);
    }

    transformPoint(p: Point2D): Point2D {
        return p.add(new RectPoint2D(
            this.#warpAmount * this.#warpX.get(p),
            this.#warpAmount * this.#warpY.get(p),
        ));
    }
}

export class LoopyWarpTransform {
    #warpAngle: Noise2D;
    #warpVariance: Noise2D;
    #warpVarianceAmount: number;
    #warpAmount: number;
    #angleAmount: number;

    constructor(amount: number, varianceScale: number, variance: number, loopScale: number, loopiness: number, rng: Random) {
        this.#warpAmount = amount;
        this.#warpAngle = new Noise2D(loopScale, rng);
        this.#warpVariance = new Noise2D(varianceScale, rng);
        this.#warpVarianceAmount = variance;
        this.#angleAmount = loopiness*loopScale;
    }

    transformPoint(p: Point2D): Point2D {
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
        return p.add(warp);
    }
}

export class LoopyWarpByAmountTransform {
    #warpAngle: Noise2D;
    #warpVariance: Noise2D;
    #warpVarianceAmount: number;
    #warpAmount: Function2D<number>;
    #angleOffset: number;
    #angleAmount: number;

    constructor(amount: Function2D<number>, varianceScale: number, variance: number, loopScale: number, loopiness: number, rng: Random) {
        this.#warpAmount = amount;
        this.#warpAngle = new Noise2D(loopScale, rng);
        this.#warpVariance = new Noise2D(varianceScale, rng);
        this.#warpVarianceAmount = variance;
        this.#angleAmount = loopiness*loopScale;
        this.#angleOffset = rng.real(0, 2*Math.PI);
    }

    transFormPoint(p: Point2D): Point2D {
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
        return p.add(warp);
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

function edgeProximityFunctionGenerator<R extends Region2D>(region: R, edgeWidth: number): NumericFunction2D {
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

export function generateTerrainDebug<R extends Region2D>(region: R, edgeWidth: number, teePos: Point2D, flagPos: Point2D, rng: Random, debug?: TerrainDebugSettings): Hole<R> | DebugMap<R> {
    let mB = new MapBuilder(region, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(region.tile(
        mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03)
    ));

    let edgeProximityFn = edgeProximityFunctionGenerator(region, edgeWidth);
    if (debug?.is('map', 'edge')) return new DebugMap(region.tile(edgeProximityFn));

    const holeSize = 10;
    const teeSize = 10;
    let endsFn = new NumericLiteralFunction2D(p => {
        let holeProx = 1 - Math.min(holeSize, p.sub(flagPos).magnitude())/holeSize;
        let teeProx = 1 - Math.min(teeSize, p.sub(teePos).magnitude())/teeSize;
        return Math.max(holeProx, teeProx);
    });
    const endsMap = region.tile(endsFn).asNumeric();
    if (debug?.is('map', 'pathEnds')) return new DebugMap(region.tile(endsFn));

    const pathWidth = 15;
    const heatFnGenerator = (distFn: (p: Point2D) => number) => new NumericLiteralFunction2D(p => 1 - Math.min(pathWidth, distFn(p))/pathWidth);
    const pathLoopyAmountFn = NumericFunction2D.product(
        endsFn.invert().clamp(),
        edgeProximityFn.invert().clamp(),
    ).multiply(15);
    const pathMapTransform = new LoopyWarpByAmountTransform(pathLoopyAmountFn, 5, 0, 40, 0.015, mB.nextRng());

    let basePathHeatFn = heatFnGenerator(p => distToSegment(p, flagPos, teePos));
    let pathFn = basePathHeatFn.mapInput(p => pathMapTransform.transFormPoint(p));
    const pathMap = region.tile(pathFn).asNumeric();
    if (debug?.is('map', 'path')) return new DebugMap(region.tile(
        !debug?.get('m')
            ? !debug?.get('n') ? pathFn : pathLoopyAmountFn.multiply(1/10)
            : basePathHeatFn
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

    const map = region.tile(p => {
        if (p.equals(flagPos)) {
            return CellType.Flag;
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

    // const SAMPLE_SPACING = 4;
    //
    // const vecToHole = holePos.sub(teePos);
    // const holeLength = vecToHole.magnitude();
    // const actualSampleSpacing = holeLength / Math.floor(holeLength/SAMPLE_SPACING); // Bigger than SAMPLE_SPACING
    // const unitVecToHole = vecToHole.mult(1/holeLength);
    //
    // let sampleResults = [];
    // let sampleDebug = [];
    // let sampleNum = 0;
    // for (let i = actualSampleSpacing/2; i < holeLength; i += actualSampleSpacing) {
    //     const pos = teePos.add(unitVecToHole.mult(i));
    //     const sampleHeatFn = heatFnGenerator(p => p.sub(pos).magnitude())
    //         .mapInput(p => pathMapTransform.transFormPoint(p));
    //     const sampleFn = sampleHeatFn.map(v => v > 0.6);
    //     if (debug?.is('map', 'par') && Math.floor(debug?.get('parSample')) === sampleNum) {
    //         if (debug?.get('m')) return new DebugMap(region.tile(sampleHeatFn));
    //         return new DebugMap(region.tile(sampleFn));
    //     }
    //     sampleNum++;
    //
    //     let numCells = 0;
    //     let numFairway = 0;
    //     let numRough = 0;
    //     let numTree = 0
    //     let numRock = 0;
    //     let numSand = 0;
    //     let numWater = 0;
    //     map.forEach((cell, p) => {
    //         if (sampleFn.get(p)) {
    //             numCells += 1;
    //             if (cell === CellType.Fairway) {
    //                 numFairway += 1;
    //             } else if (cell === CellType.Rough) {
    //                 numRough += 1;
    //             } else if (cell === CellType.Tree) {
    //                 numTree += 1;
    //             } else if (cell === CellType.Rock) {
    //                 numRock += 1;
    //             } else if (cell === CellType.Sand) {
    //                 numSand += 1;
    //             } else if (cell === CellType.Water) {
    //                 numWater += 1;
    //             }
    //         }
    //     });
    //     sampleResults.push(1);
    //     sampleDebug.push({
    //         cells: numCells,
    //         fairway: numFairway,
    //         rough: numRough,
    //         tree: numTree,
    //         rock: numRock,
    //         sand: numSand,
    //         water: numWater,
    //     });
    // }
    // console.log(sampleDebug);

    const pathfindingCostMap = map.mapNew(cell => {
        switch (cell) {
            case CellType.Fairway: return 0.8;
            case CellType.Rough: return 1;
            case CellType.Tree: return 2;
            case CellType.Sand: return 2;
            case CellType.Rock: return 5;
            case CellType.Water: return 3;
            case CellType.Flag: return 0;
            default: throw new Error(`Unknown cell type ${cell}`);
        }
    }).asNumeric()
        .blur(3)
        .map((v, p) => map.get(p) === CellType.Rock ? Infinity : v);
    const pathToHole = aStar(pathfindingCostMap, teePos, flagPos);
    let parEstimate = Math.round((pathToHole?.reduce((sum, nextP) => sum + pathfindingCostMap.get(nextP), 0) ?? 0) / 3.5);
    if (debug?.is('map', 'par')) {
        if (debug?.get('m')) return new DebugMap(pathfindingCostMap.copy().multiply(0.3));
        const pathToHoleMap = region.tilingOf(false);
        pathToHole?.forEach(p => pathToHoleMap.set(p, true));
        return new DebugMap(pathToHoleMap);
    }

    return new Hole(map, teePos, flagPos, parEstimate);
}

export function generateHexTerrainDebug(size: number, teePos: HexPoint2D, flagPos: HexPoint2D, rng: Random, debug?: TerrainDebugSettings): Hole<HexRegion2D> | DebugMap<HexRegion2D> {
    const region = new HexRegion2D(-size + 1, size, -size + 1, size, -size + 1, size);
    return generateTerrainDebug(region, 0.25*size, teePos, flagPos, rng, debug);
}

export function generateRectTerrainDebug(width: number, height: number, teePos: RectPoint2D, flagPos: RectPoint2D, rng: Random, debug?: TerrainDebugSettings): Hole<RectRegion2D> | DebugMap<RectRegion2D> {
    const region = new RectRegion2D(width, height);
    return generateTerrainDebug(region, 0.2*Math.min(width, height), teePos, flagPos, rng, debug);
}

export function generateTerrain(width: number, height: number, teePos: RectPoint2D, flagPos: RectPoint2D, rng: Random): Hole<RectRegion2D> {
    const region = new RectRegion2D(width, height);
    let maybeTerrain = generateTerrainDebug(region, 0.2*Math.min(width, height), teePos, flagPos, rng);
    if (maybeTerrain instanceof DebugMap) {
        throw new Error("Terrain Generation returned debug map without any debug settings being supplied.");
    }
    return maybeTerrain as Hole<RectRegion2D>; // TODO Remove need for cast
}