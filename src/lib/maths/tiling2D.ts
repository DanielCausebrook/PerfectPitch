import {HexPoint2D, type Point2D, RectPoint2D} from "$lib/maths/point2D";
import gaussian from "gaussian";
import type {Function2D} from "$lib/maths/function2D";

export interface Region2D {
    contains(point: Point2D): boolean;
    tilingOf<V>(value: V): Tiling2D<this, V>;
    tile<V>(fn: Function2D<V>|((p: Point2D) => V)): Tiling2D<this, V>;
    sum(...tilings: Tiling2D<this, number>[]): NumericTiling2D<this>;
    product(...tilings: Tiling2D<this, number>[]): NumericTiling2D<this>;
    equals(other: Region2D): boolean;
}

export class RectRegion2D implements Region2D {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    contains(point: Point2D): boolean {
        let p = point.toRect().toCell();
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    tilingOf<V>(value: V): RectTiling2D<this, V> {
        return RectTiling2D.of(this, value);
    }

    tile<V>(fn: Function2D<V>|((p: RectPoint2D) => V)): RectTiling2D<this, V> {
        if ("get" in fn) {
            return RectTiling2D.build(this, p => fn.get(p));
        } else {
            return RectTiling2D.build(this, fn);
        }
    }

    sum(...tilings: Tiling2D<RectRegion2D, number>[]): NumericRectTiling2D<this> {
        return this.tile(p =>
            tilings.reduce((sum, tiling) => sum + tiling.get(p), 0)
        ).asNumeric();
    }

    offsetSum(offset: number, ...tilings: Tiling2D<RectRegion2D, number>[]): NumericRectTiling2D<this> {
        return this.tile(p =>
            tilings.reduce((sum, tiling) => sum + tiling.get(p) - offset, offset)
        ).asNumeric();
    }

    product(...tilings: Tiling2D<RectRegion2D, number>[]): NumericRectTiling2D<this> {
        return this.tile(p =>
            tilings.reduce((prod, tiling) => prod * tiling.get(p), 1)
        ).asNumeric();
    }

    equals(other: Region2D): boolean {
        return other instanceof RectRegion2D ? (
            this.width === other.width
            && this.height === other.height
        ) : false;
    }
}

export class HexRegion2D implements Region2D {
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

    contains(point: Point2D): boolean {
        let p = point.toHex().toCell();
        return p.q >= this.qMin && p.q < this.qMax
            && p.r >= this.rMin && p.r < this.rMax
            && p.s >= this.sMin && p.s < this.sMax;
    }

    tilingOf<V>(value: V): HexTiling2D<this, V> {
        return HexTiling2D.of(this, value);
    }

    tile<V>(fn: Function2D<V>|((p: HexPoint2D) => V)): HexTiling2D<this, V> {
        if ("get" in fn) {
            return HexTiling2D.build(this, p => fn.get(p));
        } else {
            return HexTiling2D.build(this, fn);
        }
    }

    sum(...tilings: Tiling2D<HexRegion2D, number>[]): NumericHexTiling2D<this> {
        return this.tile(p =>
            tilings.reduce((sum, tiling) => sum + tiling.get(p), 0)
        ).asNumeric();
    }

    product(...tilings: Tiling2D<HexRegion2D, number>[]): NumericHexTiling2D<this> {
        return this.tile(p =>
            tilings.reduce((prod, tiling) => prod * tiling.get(p), 1)
        ).asNumeric();
    }

    equals(other: Region2D): boolean {
        return other instanceof HexRegion2D ? (
            this.qMin === other.qMin && this.qMax === other.qMax
            && this.rMin === other.rMin && this.rMax === other.rMax
            && this.sMin === other.sMin && this.sMax === other.sMax
        ) : false;
    }
}

export interface Tiling2D<out R extends Region2D, V> {
    readonly bounds: R;

    get(point: Point2D): V;
    set(point: Point2D, value: V): void;
    forEach(fn: (value: V, p: Point2D) => void): void;
    map(fn: (v: V, p: Point2D) => V): this;
    mapNew<V2>(fn: (v: V, p: Point2D) => V2): Tiling2D<R, V2>;
    copy(): Tiling2D<R, V>;
    asNumeric(): V extends number ? NumericTiling2D<R> : never;
}

export interface NumericTiling2D<out R extends Region2D> extends Tiling2D<R, number> {
    copy(): NumericTiling2D<R>;
    add(v: number): this;
    multiply(factor: number, center?: number): this;
    pinch(amount: number, center?: number, range?: number): this;
    invert(): this;
    clamp(low?: number, high?: number): this;
    threshold(value: number): this;
    boolThreshold(value: number): Tiling2D<R, boolean>;
    blur(sigma: number): this;
}

export class RectTiling2D<out R extends RectRegion2D, V> implements Tiling2D<R, V> {
    readonly bounds: R;
    data: V[][];

    constructor(bounds: R, data: V[][]) {
        this.bounds = bounds;
        this.data = data;
    }

    static of<R extends RectRegion2D, T>(bounds: R, value: T): RectTiling2D<R, T> {
        return new RectTiling2D(bounds, Array(bounds.width).fill(null).map(_ => Array(bounds.height).fill(value)));
    }

    static build<R extends RectRegion2D, T>(bounds: R, fn: (p: RectPoint2D) => T): RectTiling2D<R, T> {
        let data = [];
        for (let x = 0; x < bounds.width; x++) {
            let col = [];
            for (let y = 0; y < bounds.height; y++) {
                col.push(fn(new RectPoint2D(x, y)));
            }
            data.push(col);
        }
        return new RectTiling2D(bounds, data);
    }

    get(point: Point2D): V {
        const p = point.toRect().toCell();
        return this.data[p.x][p.y];
    }

    set(point: Point2D, value: V) {
        const p = point.toRect().toCell();
        if (this.bounds.contains(p)) {
            this.data[p.x][p.y] = value;
        }
    }

    forEach(fn: (value: V, p: RectPoint2D) => void) {
        for (let x = 0; x < this.bounds.width; x++) {
            for (let y = 0; y < this.bounds.height; y++) {
                fn(this.data[x][y], new RectPoint2D(x, y));
            }
        }
    }

    map(fn: (value: V, point: Point2D) => V): this {
        for (let x = 0; x < this.bounds.width; x++) {
            for (let y = 0; y < this.bounds.height; y++) {
                this.data[x][y] = fn(this.data[x][y], new RectPoint2D(x, y));
            }
        }
        return this;
    }
    copy(): RectTiling2D<R, V> {
        return new RectTiling2D(this.bounds, this.data.map(col => col.slice()));
    }

    mapNew<U>(fn: (v: V, p: Point2D) => U): RectTiling2D<R, U> {
        let data = [];
        for (let x = 0; x < this.bounds.width; x++) {
            let col = [];
            for (let y = 0; y < this.bounds.height; y++) {
                col.push(fn(this.data[x][y], new RectPoint2D(x, y)));
            }
            data.push(col);
        }
        return new RectTiling2D(this.bounds, data);
    }
    asNumeric(): V extends number ? NumericRectTiling2D<R> : never {
        return new NumericRectTiling2D(this.bounds, this.data as number[][]) as V extends number ? NumericRectTiling2D<R> : never;
    }
}

export class NumericRectTiling2D<out R extends RectRegion2D> extends RectTiling2D<R, number> implements NumericTiling2D<RectRegion2D> {
    copy(): NumericRectTiling2D<R> {
        return new NumericRectTiling2D(this.bounds, this.data.map(col => col.slice()));
    }

    add(v: number): this {
        return this.map(u => u + v);
    }
    multiply(factor: number, center?: number): this {
        center = center ?? 0;
        return this.map(v => center + (v-center) * factor);
    }
    pinch(amount: number, center?: number, range?: number): this {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        return this.map(v => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            return center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        });
    }
    invert(): this {
        return this.map(v => 1-v);
    }
    clamp(low?: number, high?: number): this {
        low = low??0;
        high = high??1;
        return this.map(v => Math.min(high, Math.max(low, v)));
    }
    threshold(value: number): this {
        return this.map(v => v >= value ? 1 : 0);
    }
    boolThreshold(value: number): RectTiling2D<R, boolean> {
        return this.mapNew(v => v >= value);
    }
    blur(sigma: number): this {
        if (sigma === 0) return this;
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

        let blurredCols = this.bounds.tile(p => {
            let val = 0;
            let max = 0;
            for (let i = -valuesWidth; i <= valuesWidth; i++) {
                const samplePoint = p.add(new RectPoint2D(0, i));
                if (this.bounds.contains(samplePoint)) {
                    max += gaussianValues[i+ valuesWidth];
                    val += this.get(samplePoint) * gaussianValues[i + valuesWidth];
                }
            }
            return max === 0 ? 0 : val / max;
        })
        return this.map((v, p) => {
            let kernelSum = 0;
            let weightedSum = 0;
            for (let i = -valuesWidth; i <= valuesWidth; i++) {
                const samplePoint = p.add(new RectPoint2D(i, 0));
                if (blurredCols.bounds.contains(samplePoint)) {
                    kernelSum += gaussianValues[i+ valuesWidth];
                    weightedSum += blurredCols.get(samplePoint) * gaussianValues[i + valuesWidth];
                }
            }
            return kernelSum === 0 ? 0 : weightedSum / kernelSum;
        })
    }
}

export class HexTiling2D<out R extends HexRegion2D, V> implements Tiling2D<R, V> {
    readonly bounds: R;
    data: (V|null)[][];

    constructor(bounds: R, data: (V|null)[][]) {
        this.bounds = bounds;
        this.data = data;
    }

    static of<R extends HexRegion2D, T>(bounds: R, value: T): HexTiling2D<R, T> {
        const qSize = bounds.qMax - bounds.qMin;
        const rSize = bounds.rMax - bounds.rMin;
        return new HexTiling2D(bounds, Array(qSize).fill(null).map(_ => Array(rSize).fill(value)));
    }

    static build<R extends HexRegion2D, T>(bounds: R, fn: (p: HexPoint2D) => T): HexTiling2D<R, T> {
        const qSize = bounds.qMax - bounds.qMin;
        const rSize = bounds.rMax - bounds.rMin;

        let data = [];
        for (let q = 0; q < qSize; q++) {
            let col = [];
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint2D(q + bounds.qMin, r + bounds.rMin);
                if (p.s >= bounds.sMin && p.s < bounds.sMax) {
                    col.push(fn(p));
                } else {
                    col.push(null);
                }
            }
            data.push(col);
        }
        return new HexTiling2D(bounds, data);
    }

    get(point: Point2D): V {
        const p = point.toHex().toCell();
        // @ts-ignore Caller must not ask for out-of-bounds point
        return this.data[p.q - this.bounds.qMin][p.r - this.bounds.rMin];
    }

    set(point: Point2D, value: V) {
        const p = point.toHex().toCell();
        if (this.bounds.contains(p)) {
            this.data[p.q - this.bounds.qMin][p.r - this.bounds.rMin] = value;
        }
    }

    forEach(fn: (value: V, p: HexPoint2D) => void) {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        for (let q = 0; q < qSize; q++) {
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint2D(q + this.bounds.qMin, r + this.bounds.rMin);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    fn(this.data[q][r], p);
                }
            }
        }
    }

    map(fn: (value: V, point: HexPoint2D) => V): this {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        for (let q = 0; q < qSize; q++) {
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint2D(q + this.bounds.qMin, r + this.bounds.rMin);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    this.data[q][r] = fn(this.data[q][r], p);
                }
            }
        }
        return this;
    }
    copy(): HexTiling2D<R, V> {
        return new HexTiling2D(this.bounds, this.data);
    }
    mapNew<U>(fn: (v: V, p: Point2D) => U): HexTiling2D<R, U> {
        const qSize = this.bounds.qMax - this.bounds.qMin;
        const rSize = this.bounds.rMax - this.bounds.rMin;

        let data = [];
        for (let q = 0; q < qSize; q++) {
            let col = [];
            for (let r = 0; r < rSize; r++) {
                const p = new HexPoint2D(q + this.bounds.qMin, r + this.bounds.rMin);
                if (p.s >= this.bounds.sMin && p.s < this.bounds.sMax) {
                    // @ts-ignore Should always be in-bounds
                    col.push(fn(this.data[q][r], p));
                } else {
                    col.push(null);
                }
            }
            data.push(col);
        }
        return new HexTiling2D(this.bounds, data);

    }

    asNumeric(): V extends number ? NumericHexTiling2D<R> : never {
        return new NumericHexTiling2D(this.bounds, this.data as number[][]) as V extends number ? NumericHexTiling2D<R> : never;
    }
}

export class NumericHexTiling2D<out R extends HexRegion2D> extends HexTiling2D<R, number> implements NumericTiling2D<HexRegion2D> {
    copy(): NumericHexTiling2D<R> {
        return new NumericHexTiling2D(this.bounds, this.data.map(col => col.slice()));
    }

    add(v: number): this {
        return this.map(u => u + v);
    }
    multiply(factor: number, center?: number): this {
        center = center ?? 0;
        return this.map(v => center + (v-center) * factor);
    }
    pinch(amount: number, center?: number, range?: number): this {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        return this.map(v => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            return center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        });
    }
    invert(): this {
        return this.map(v => 1-v);
    }
    clamp(low?: number, high?: number): this {
        low = low??0;
        high = high??1;
        return this.map(v => Math.min(high, Math.max(low, v)));
    }
    threshold(value: number): this {
        return this.map(v => v >= value ? 1 : 0);
    }
    boolThreshold(value: number): HexTiling2D<R, boolean> {
        return this.mapNew(v => v >= value);
    }
    blur(sigma: number): this {
        if (sigma === 0) return this;
        const maxDist = 3*sigma;
        const minL = Math.ceil(-maxDist);
        const maxL = Math.ceil(maxDist);
        const plane = new HexRegion2D(minL, maxL, minL, maxL, minL, maxL);
        const distribution = gaussian(0, sigma);
        let kernel = plane.tile(p => {
            let dist = p.magnitude();
            return distribution.cdf(dist + 0.5) - distribution.cdf(dist - 0.5);
        });

        const original = this.copy();
        // original.forEach((value, p) => {
        //     if (value == 0) {
        //         return;
        //     }
        //     const localKernel = kernel.map((kValue, kP) => original.bounds.contains(p.add(kP)) ? kValue : 0);
        //     let kernelSum = 0;
        //     localKernel.forEach(kValue => kernelSum += kValue);
        //     localKernel.forEach((kValue, kP) => {
        //         if (kValue == 0) {
        //             return;
        //         }
        //         const target = p.add(kP);
        //         this.set(target, this.get(target) + value*kValue/kernelSum);
        //     })
        // });
        return this.map((unusedValue, p) => {
            let kernelSum = 0;
            let weightedSum = 0;
            kernel.forEach((kV, kP) => {
                const samplePoint = p.add(kP);
                if (this.bounds.contains(samplePoint)) {
                    kernelSum += kV;
                    weightedSum += original.get(samplePoint) * kV;
                }
            })
            return kernelSum === 0 ? 0 : weightedSum / kernelSum;
        });
    }
}