import {RectDirection, RectPoint2D} from "$lib/maths/point2D";
import {MersenneTwister19937, Random} from "random-js";
import {RectRegion2D, RectTiling2D} from "$lib/maths/tiling2D";
import {CellType, Hole} from "$lib/hole";
import {NumericFunction2D} from "$lib/maths/function2D";
import {MapBuilder} from "./terrainGeneration";
import {DebugMap, TerrainDebugSettings} from "$lib/terrainDebug";

export function loopErasedRandomWalk(walls: RectTiling2D<RectRegion2D, boolean>, start: RectPoint2D, end: RectPoint2D, rng: Random): RectPoint2D[] {
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

export function generateOldRectTerrainDebug(width: number, height: number, xEdge: number, yEdge: number, teePos: RectPoint2D, holePos: RectPoint2D, rng: Random, debug?: TerrainDebugSettings): Hole<RectRegion2D> | DebugMap<RectRegion2D> {
    const region = new RectRegion2D(width, height);
    let mB = new MapBuilder(region, rng);

    if (debug?.is('map', 'noise')) return new DebugMap(region.tile(
        mB.buildLoopyNoiseMap(10, 5, 20, 2, 45, 0.03)
    ));

    let edgeProximityMap = region.tile(p => {
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
    if (debug?.is('map', 'edge')) return new DebugMap(edgeProximityMap.copy().invert());


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
        region.product(
            region.tile(mB.buildWarpNoiseMap(7, 8, 2.5)),
            edgeProximityMap.copy().pinch(0.2, 1),
        ).invert(),
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

    return new Hole(region.tile(p => {
        if (p.equals(holePos)) {
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
            case fairwayMap.get(p):
                return CellType.Fairway;
            default:
                return CellType.Rough;
        }
    }), teePos, holePos, 0);
}
