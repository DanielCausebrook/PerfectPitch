/*

Hex grid:
https://www.redblobgames.com/grids/hexagons/

┌─────────────────────────────────────┐
│  .       S       .       R       .  │
│      .       .       .       .      │
│  .       . 3     .    -3 .       .  │
│      .       2      -2       .      │
│  .       .       .       .       .  │
│      .       . 1  -1 .       .      │
│  q  -3  -2  -1   O   1   2   3   Q  │
│      .       .       .       .      │
│  .       .     1 .-1     .       .  │
│      .       2      -2       .      │
│  .       .       .       .       .  │
│      .     3 .       .-3     .      │
│  .       r       .       s       .  │
└─────────────────────────────────────┘

Rect coords = (x, y)
Hex coords  = (q, r)

 */

export enum RectDirection {
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW,
}

export function rotateRectDirection(direction: RectDirection, angle: number): RectDirection {
    return (((direction + angle) % 8) + 8) % 8;
}

export function getRectUnitVector(direction: RectDirection): RectPoint {
    switch (direction) {
        case RectDirection.N:
            return new RectPoint(0, 1);
        case RectDirection.NE:
            return new RectPoint(1, 1);
        case RectDirection.E:
            return new RectPoint(1, 0);
        case RectDirection.SE:
            return new RectPoint(1, -1);
        case RectDirection.S:
            return new RectPoint(0, -1);
        case RectDirection.SW:
            return new RectPoint(-1, -1);
        case RectDirection.W:
            return new RectPoint(-1, 0);
        case RectDirection.NW:
            return new RectPoint(-1, 1);
    }
}

export enum HexDirection {
    Q,
    R,
    S,
    MQ,
    MR,
    MS,
}

export function rotateHexDirection(direction: HexDirection, angle: number): HexDirection {
    return (((direction + angle) % 6) + 6) % 6;
}

export interface Point {
    toRect(): RectPoint;
    toHex(): HexPoint;
    add(other: Point): Point;
    sub(other: Point): Point;
    neg(): Point;
    mult(factor: number): Point;
    magnitude(): number;
}

export class RectPoint implements Point {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toRect(): RectPoint {
        return this;
    }

    toHex(): HexPoint {
        return new HexPoint(this.x * Math.sqrt(3)/3 - this.y * (1/3), this.y * 2/3);
    }

    add(other: Point): RectPoint {
        const otherRect = other.toRect();
        return new RectPoint(this.x + otherRect.x, this.y + otherRect.y)
    }

    sub(other: Point): RectPoint {
        const otherRect = other.toRect();
        return new RectPoint(this.x - otherRect.x, this.y - otherRect.y)
    }

    neg(): RectPoint {
        return new RectPoint(-this.x, -this.y);
    }

    mult(factor: number): Point {
        return new RectPoint(factor * this.x, factor * this.y);
    }

    magnitude(): number {
        return Math.hypot(this.x, this.y);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    equals(other: RectPoint): boolean {
        return this.x === other.x && this.y === other.y;
    }

    move(direction: RectDirection): RectPoint {
        return this.add(getRectUnitVector(direction));
    }

    toCell(): RectPoint {
        return new RectPoint(Math.floor(this.x), Math.floor(this.y));
    }
}


export class HexPoint implements Point {
    readonly q: number;
    readonly r: number;
    readonly s: number;

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
        this.s = -q-r;
    }

    add(other: Point): HexPoint {
        const otherHex = other.toHex();
        return new HexPoint(this.q + otherHex.q, this.r + otherHex.r);
    }

    sub(other: Point): HexPoint {
        const otherHex = other.toHex();
        return new HexPoint(this.q - otherHex.q, this.r - otherHex.r);
    }

    neg(): HexPoint {
        return new HexPoint(-this.q, -this.r);
    }

    mult(factor: number): HexPoint {
        return new HexPoint(factor*this.q, factor*this.r);
    }

    magnitude(): number {
        return this.toRect().magnitude();
    }

    toRect(): RectPoint {
        return new RectPoint(this.q * 3/2, - this.q * Math.sqrt(3)/2 - this.r * Math.sqrt(3));
    }

    toHex(): HexPoint {
        return this;
    }

    move(direction: HexDirection): HexPoint {
        switch (direction) {
            case HexDirection.Q: return new HexPoint(this.q + 1, this.r);
            case HexDirection.R: return new HexPoint(this.q, this.r + 1);
            case HexDirection.S: return new HexPoint(this.q + 1, this.r + 1);
            case HexDirection.MQ: return new HexPoint(this.q - 1, this.r);
            case HexDirection.MR: return new HexPoint(this.q, this.r - 1);
            case HexDirection.MS: return new HexPoint(this.q - 1, this.r - 1);
        }
    }

    toCell(): HexPoint {
        let q = Math.round(this.q);
        let r = Math.round(this.r);
        let s = Math.round(this.s);
        let qDiff = Math.abs(this.q - q);
        let rDiff = Math.abs(this.r - r);
        let sDiff = Math.abs(this.s - s);
        if (qDiff > rDiff && qDiff > sDiff) {
            q = -r-s;
        } else if (rDiff > sDiff) {
            r = -q-s;
        }
        // else s = -q-r;
        return new HexPoint(q, r);
    }
}

export interface Region {
    contains(point: Point): boolean;
    tilingOf<T>(value: T): TiledRegion<T>;
    tilingBuild<T>(fn: (p: Point) => T): TiledRegion<T>;
    equals(other: Region): boolean;
}

export class RectRegion implements Region {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    contains(point: Point): boolean {
        let p = point.toRect().toCell();
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    tilingOf<T>(value: T): TiledRectRegion<T> {
        return TiledRectRegion.of(this, value);
    }

    tilingBuild<T>(fn: (p: RectPoint) => T): TiledRectRegion<T> {
        return TiledRectRegion.build(this, fn);
    }

    equals(other: Region): boolean {
        return other instanceof RectRegion ? (
            this.width === other.width
            && this.height === other.height
        ) : false;
    }
}

export class HexRegion implements Region {
    readonly qMin: number;
    readonly qMax: number;
    readonly rMin: number;
    readonly rMax: number;
    readonly sMin: number;
    readonly sMax: number;

    constructor(qMin: number, qMax: number, rMin: number, rMax: number, sMin: number, sMax: number) {
        this.qMin = qMin;
        this.qMax = qMax;
        this.rMin = rMin;
        this.rMax = rMax;
        this.sMin = sMin;
        this.sMax = sMax;
    }

    contains(point: Point): boolean {
        let p = point.toHex().toCell();
        return p.q >= this.qMin && p.q < this.qMax
            && p.r >= this.rMin && p.r < this.rMax
            && p.s >= this.sMin && p.s < this.sMax;
    }

    tilingOf<T>(value: T): TiledHexRegion<T> {
        return TiledHexRegion.of(this, value);
    }

    tilingBuild<T>(fn: (p: HexPoint) => T): TiledHexRegion<T> {
        return TiledHexRegion.build(this, fn);
    }

    equals(other: Region): boolean {
        return other instanceof HexRegion ? (
            this.qMin === other.qMin && this.qMax === other.qMax
            && this.rMin === other.rMin && this.rMax === other.rMax
            && this.sMin === other.sMin && this.sMax === other.sMax
        ) : false;
    }
}

export interface TiledRegion<T> {
    readonly bounds: Region;

    get(point: Point): T;
    set(point: Point, value: T): void;
    forEach(fn: (value: T, p: Point) => void): void;
    map<U>(fn: (value: T, p: Point) => U): TiledRegion<U>;
    mapInPlace(fn: (value: T, p: Point) => T): void;
    copy(): TiledRegion<T>;
}

export class TiledRectRegion<T> implements TiledRegion<T> {
    readonly bounds: RectRegion;
    data: T[][];

    constructor(bounds: RectRegion, data: T[][]) {
        this.bounds = bounds;
        this.data = data;
    }

    static of<T>(bounds: RectRegion, value: T): TiledRectRegion<T> {
        return new TiledRectRegion(bounds, Array(bounds.width).fill(null).map(_ => Array(bounds.height).fill(value)));
    }

    static build<T>(bounds: RectRegion, fn: (p: RectPoint) => T): TiledRectRegion<T> {
        let data = [];
        for (let x = 0; x < bounds.width; x++) {
            let col = [];
            for (let y = 0; y < bounds.height; y++) {
                col.push(fn(new RectPoint(x, y)));
            }
            data.push(col);
        }
        return new TiledRectRegion(bounds, data);
    }

    get(point: Point): T {
        const p = point.toRect().toCell();
        return this.data[p.x][p.y];
    }

    set(point: Point, value: T) {
        const p = point.toRect().toCell();
        if (this.bounds.contains(p)) {
            this.data[p.x][p.y] = value;
        }
    }

    forEach(fn: (value: T, p: RectPoint) => void) {
        for (let x = 0; x < this.bounds.width; x++) {
            for (let y = 0; y < this.bounds.height; y++) {
                fn(this.data[x][y], new RectPoint(x, y));
            }
        }
    }

    map<U>(fn: (value: T, point: Point) => U): TiledRegion<U> {
        let data = [];
        for (let x = 0; x < this.bounds.width; x++) {
            let col = [];
            for (let y = 0; y < this.bounds.height; y++) {
                col.push(fn(this.data[x][y], new RectPoint(x, y)));
            }
            data.push(col);
        }
        return new TiledRectRegion(this.bounds, data);
    }

    mapInPlace(fn: (value: T, point: Point) => T) {
        for (let x = 0; x < this.bounds.width; x++) {
            for (let y = 0; y < this.bounds.height; y++) {
                this.data[x][y] = fn(this.data[x][y], new RectPoint(x, y));
            }
        }
    }

    copy(): TiledRectRegion<T> {
        return new TiledRectRegion(this.bounds, this.data.map(col => col.slice()));
    }
}

export class TiledHexRegion<T> implements TiledRegion<T> {
    readonly bounds: HexRegion;
    data: (T|null)[][];

    private constructor(bounds: HexRegion, data: (T|null)[][]) {
        this.bounds = bounds;
        this.data = data;
    }

    static of<T>(bounds: HexRegion, value: T): TiledHexRegion<T> {
        const qSize = bounds.qMax - bounds.qMin;
        const rSize = bounds.rMax - bounds.rMin;
        return new TiledHexRegion(bounds, Array(qSize).fill(null).map(_ => Array(rSize).fill(value)));
    }

    static build<T>(bounds: HexRegion, fn: (p: HexPoint) => T): TiledHexRegion<T> {
        const qSize = bounds.qMax - bounds.qMin;
        const rSize = bounds.rMax - bounds.rMin;

        let data = [];
        for (let q = 0; q < qSize; q++) {
            let col = [];
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint(q, r);
                if (p.s >= bounds.sMin && p.s < bounds.sMax) {
                    col.push(fn(p));
                } else {
                    col.push(null);
                }
            }
            data.push(col);
        }
        return new TiledHexRegion(bounds, data);
    }

    get(point: Point): T {
        const p = point.toHex().toCell();
        // @ts-ignore Caller must not ask for out-of-bounds point
        return this.data[p.q][p.r];
    }

    set(point: Point, value: T) {
        const p = point.toHex().toCell();
        if (this.bounds.contains(p)) {
            this.data[p.q][p.r] = value;
        }
    }

    forEach(fn: (value: T, p: HexPoint) => void) {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        for (let q = 0; q < qSize; q++) {
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint(q, r);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    fn(this.data[q][r], p);
                }
            }
        }
    }

    map<U>(fn: (value: T, point: HexPoint) => U): TiledRegion<U> {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        let data = [];
        for (let q = 0; q < qSize; q++) {
            let col = [];
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint(q, r);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    col.push(fn(this.data[q][r], p));
                } else {
                    col.push(null);
                }
            }
            data.push(col);
        }
        return new TiledHexRegion(this.bounds, data);
    }

    mapInPlace(fn: (value: T, point: HexPoint) => T) {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        for (let q = 0; q < qSize; q++) {
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint(q, r);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    this.data[q][r] = fn(this.data[q][r], p);
                }
            }
        }
    }

    copy(): TiledHexRegion<T> {
        return new TiledHexRegion(this.bounds, this.data.map(col => col.slice()));
    }
}
