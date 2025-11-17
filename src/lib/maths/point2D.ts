/*

Hex grid:
https://www.redblobgames.com/grids/hexagons/

┌─────────────────────────────────────┐
│  .       S       .       r       .  │
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
│  .       R       .       s       .  │
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

export function getRectUnitVector(direction: RectDirection): RectPoint2D {
    switch (direction) {
        case RectDirection.N:
            return new RectPoint2D(0, 1);
        case RectDirection.NE:
            return new RectPoint2D(1, 1);
        case RectDirection.E:
            return new RectPoint2D(1, 0);
        case RectDirection.SE:
            return new RectPoint2D(1, -1);
        case RectDirection.S:
            return new RectPoint2D(0, -1);
        case RectDirection.SW:
            return new RectPoint2D(-1, -1);
        case RectDirection.W:
            return new RectPoint2D(-1, 0);
        case RectDirection.NW:
            return new RectPoint2D(-1, 1);
    }
}

export enum HexDirection {
    Sr, // N
    Qr, // NE
    Qs, // SE
    Rs, // S
    Rq, // SW
    Sq, // NW
}

export function rotateHexDirection(direction: HexDirection, angle: number): HexDirection {
    return (((direction + angle) % 6) + 6) % 6;
}

export function getHexUnitVector(direction: HexDirection): HexPoint2D {
    switch (direction) {
        case HexDirection.Sr:
            return new HexPoint2D(0, -1);
        case HexDirection.Qr:
            return new HexPoint2D(1, -1);
        case HexDirection.Qs:
            return new HexPoint2D(1, 0);
        case HexDirection.Rs:
            return new HexPoint2D(0, 1);
        case HexDirection.Rq:
            return new HexPoint2D(-1, 1);
        case HexDirection.Sq:
            return new HexPoint2D(-1, 0);
    }
}

export interface Point2D {
    toRect(): RectPoint2D;
    toHex(): HexPoint2D;
    add(other: Point2D): Point2D;
    sub(other: Point2D): Point2D;
    neg(): Point2D;
    mult(factor: number): Point2D;
    magnitude(): number;
    equals(other: Point2D): boolean;
}

export class RectPoint2D implements Point2D {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromPolar(r: number, theta: number) {
        return new RectPoint2D(r * Math.cos(theta), r * Math.sin(theta));
    }

    toRect(): RectPoint2D {
        return this;
    }

    toHex(): HexPoint2D {
        return new HexPoint2D(this.x * 2/3, this.x * -1/3 + this.y * Math.sqrt(3)/3);
    }

    add(other: Point2D): RectPoint2D {
        const otherRect = other.toRect();
        return new RectPoint2D(this.x + otherRect.x, this.y + otherRect.y)
    }

    sub(other: Point2D): RectPoint2D {
        const otherRect = other.toRect();
        return new RectPoint2D(this.x - otherRect.x, this.y - otherRect.y)
    }

    neg(): RectPoint2D {
        return new RectPoint2D(-this.x, -this.y);
    }

    mult(factor: number): RectPoint2D {
        return new RectPoint2D(factor * this.x, factor * this.y);
    }

    magnitude(): number {
        return Math.hypot(this.x, this.y);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    equals(other: RectPoint2D): boolean {
        return this.x === other.x && this.y === other.y;
    }

    move(direction: RectDirection): RectPoint2D {
        return this.add(getRectUnitVector(direction));
    }

    toCell(): RectPoint2D {
        return new RectPoint2D(Math.floor(this.x), Math.floor(this.y));
    }
}


export class HexPoint2D implements Point2D {
    readonly q: number;
    readonly r: number;
    readonly s: number;

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
        this.s = -q-r;
    }

    add(other: Point2D): HexPoint2D {
        const otherHex = other.toHex();
        return new HexPoint2D(this.q + otherHex.q, this.r + otherHex.r);
    }

    sub(other: Point2D): HexPoint2D {
        const otherHex = other.toHex();
        return new HexPoint2D(this.q - otherHex.q, this.r - otherHex.r);
    }

    neg(): HexPoint2D {
        return new HexPoint2D(-this.q, -this.r);
    }

    mult(factor: number): HexPoint2D {
        return new HexPoint2D(factor*this.q, factor*this.r);
    }

    magnitude(): number {
        return this.toRect().magnitude();
    }

    toRect(): RectPoint2D {
        return new RectPoint2D(this.q * 3/2, - this.q * Math.sqrt(3)/2 - this.r * Math.sqrt(3));
    }

    toHex(): HexPoint2D {
        return this;
    }

    move(direction: HexDirection): HexPoint2D {
        return this.add(getHexUnitVector(direction));
    }

    toCell(): HexPoint2D {
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
        return new HexPoint2D(q, r);
    }

    equals(other: HexPoint2D) {
        return this.s === other.s && this.q === other.q;
    }
}

