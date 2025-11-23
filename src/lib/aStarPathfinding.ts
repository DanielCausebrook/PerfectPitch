import type {Region2D, Tiling2D} from "$lib/maths/tiling2D";
import {
    HexDirection,
    HexPoint2D,
    type Point2D,
    RectDirection,
    RectPoint2D
} from "$lib/maths/point2D";

function pHash(p: Point2D): string {
    if (p instanceof RectPoint2D) {
        return p.x.toString() + ", " + p.y.toString();
    } else if (p instanceof HexPoint2D) {
        return p.q.toString()+ ", " + p.r.toString();
    } else {
        throw new Error("Unsupported point type.");
    }
}

function possibleNeighbours(p: Point2D): Point2D[] {
    if (p instanceof RectPoint2D) {
        return [
            RectDirection.N,
            RectDirection.NE,
            RectDirection.E,
            RectDirection.SE,
            RectDirection.S,
            RectDirection.SW,
            RectDirection.W,
            RectDirection.NW,
        ].map(d => p.move(d));
    } else if (p instanceof HexPoint2D) {
        return [
            HexDirection.Sr, // N
            HexDirection.Qr, // NE
            HexDirection.Qs, // SE
            HexDirection.Rs, // S
            HexDirection.Rq, // SW
            HexDirection.Sq, // NW
        ].map(d => p.move(d));
    } else {
        throw new Error("Unsupported point type.");
    }
}

// https://en.wikipedia.org/wiki/A*_search_algorithm
export function aStar<R extends Region2D>(map: Tiling2D<R, number>, start: Point2D, end: Point2D): Point2D[]|null {
    const heuristic = (p: Point2D) => p.sub(end).magnitude();
    const neighbours = (p: Point2D) => possibleNeighbours(p).filter(p => map.bounds.contains(p))

    const openSet = new Map<string, Point2D>();
    const openSet_has = (p: Point2D) => openSet.has(pHash(p));
    const openSet_add = (p: Point2D) => openSet.set(pHash(p), p);
    const openSet_delete = (p: Point2D) => openSet.delete(pHash(p));
    const openSet_iter = () => openSet.values();
    openSet_add(start);

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    const cameFrom = new Map();
    const cameFrom_has = (p: Point2D) => cameFrom.has(pHash(p));
    const cameFrom_get = (p: Point2D) => cameFrom.get(pHash(p));
    const cameFrom_set = (p: Point2D, from: Point2D) => cameFrom.set(pHash(p), from);

    const reconstructPath = (p: Point2D) => {
        let current = p;
        let path = [current];
        while (cameFrom_has(current)) {
            current = cameFrom_get(current);
            path.unshift(current);
        }
        return path;
    }

    // For node n, gScore[n] is the currently known cost of the cheapest path from start to n.
    const gScore = new Map(); // Default Inf
    const gScore_get = (p: Point2D) => gScore.get(pHash(p)) ?? Infinity;
    const gScore_set = (p: Point2D, v: number) => gScore.set(pHash(p), v);
    gScore_set(start, 0);

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    const fScore = new Map(); // Default Inf
    const fScore_get = (p: Point2D) => fScore.get(pHash(p)) ?? Infinity;
    const fScore_set = (p: Point2D, v: number) => fScore.set(pHash(p), v);
    fScore_set(start, heuristic(start));

    while (openSet.size > 0) {
        const current = openSet_iter().reduce((best: Point2D|null, next) => best !== null && fScore_get(best) <= fScore_get(next) ? best : next, null);
        if (current === null) {
            throw new Error();
        }
        if(current.equals(end)) {
            return reconstructPath(current);
        }
        openSet_delete(current);

        for (const neighbour of neighbours(current)) {
            const neighbourDist = map.get(neighbour);
            const tentativeGScore = gScore_get(current) + neighbourDist;
            if (tentativeGScore < gScore_get(neighbour)) {
                cameFrom_set(neighbour, current);
                gScore_set(neighbour, tentativeGScore);
                fScore_set(neighbour, tentativeGScore + heuristic(neighbour));
                if (!openSet_has(neighbour)) {
                    openSet_add(neighbour);
                }
            }
        }
    }
    return null;
}


// https://en.wikipedia.org/wiki/A*_search_algorithm
export function fMinus<R extends Region2D>(map: Tiling2D<R, boolean>, start: Point2D, end: Point2D): Point2D[]|null {
    const heuristic = (p: Point2D) => p.sub(end).magnitude();
    const neighbours = (p: Point2D) => possibleNeighbours(p).filter(p => map.bounds.contains(p) && map.get(p))

    const openSet = new Map<string, Point2D>();
    const openSet_has = (p: Point2D) => openSet.has(pHash(p));
    const openSet_add = (p: Point2D) => openSet.set(pHash(p), p);
    const openSet_delete = (p: Point2D) => openSet.delete(pHash(p));
    const openSet_iter = () => openSet.values();
    openSet_add(start);

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
    // to n currently known.
    const cameFrom = new Map();
    const cameFrom_has = (p: Point2D) => cameFrom.has(pHash(p));
    const cameFrom_get = (p: Point2D) => cameFrom.get(pHash(p));
    const cameFrom_set = (p: Point2D, from: Point2D) => cameFrom.set(pHash(p), from);

    const reconstructPath = (p: Point2D) => {
        let current = p;
        let path = [current];
        while (cameFrom_has(current)) {
            current = cameFrom_get(current);
            path.unshift(current);
        }
        return path;
    }

    // For node n, gScore[n] is the currently known cost of the cheapest path from start to n.
    const gScore = new Map(); // Default Inf
    const gScore_get = (p: Point2D) => gScore.get(pHash(p)) ?? Infinity;
    const gScore_set = (p: Point2D, v: number) => gScore.set(pHash(p), v);
    gScore_set(start, 0);

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    const fScore = new Map(); // Default Inf
    const fScore_get = (p: Point2D) => fScore.get(pHash(p)) ?? Infinity;
    const fScore_set = (p: Point2D, v: number) => fScore.set(pHash(p), v);
    fScore_set(start, heuristic(start));

    while (openSet.size > 0) {
        const current = openSet_iter().reduce((best: Point2D|null, next) => best !== null && fScore_get(best) >= fScore_get(next) ? best : next, null);
        if (current === null) {
            throw new Error();
        }
        if(current.equals(end)) {
            return reconstructPath(current);
        }
        openSet_delete(current);

        for (const neighbour of neighbours(current)) {
            const neighbourDist = 1;
            const tentativeGScore = gScore_get(current) + neighbourDist;
            if (tentativeGScore < gScore_get(neighbour)) {
                cameFrom_set(neighbour, current);
                gScore_set(neighbour, tentativeGScore);
                fScore_set(neighbour, tentativeGScore + heuristic(neighbour));
                if (!openSet_has(neighbour)) {
                    openSet_add(neighbour);
                }
            }
        }
    }
    return null;
}
