import type {Point2D} from "./point2D";

export interface Function2D<T> {
    get(point: Point2D): T;
    map<T2>(fn: (v: T, p: Point2D) => T2): Function2D<T2>;
    mapInput(fn: (p: Point2D) => Point2D): Function2D<T>;
    shiftInput(point: Point2D): Function2D<T>;
    scaleInput(factor: number, center?: Point2D): Function2D<T>;
    asNumeric(): T extends number ? NumericFunction2D : never;
}

export interface NumericFunction2D extends Function2D<number> {
    mapNumeric(fn: (v: number, p: Point2D) => number): NumericFunction2D;
    mapInput(fn: (p: Point2D) => Point2D): NumericFunction2D;
    shiftInput(point: Point2D): NumericFunction2D;
    scaleInput(factor: number, center?: Point2D): NumericFunction2D;
    add(v: number): NumericFunction2D;
    multiply(factor: number, center?: number): NumericFunction2D;
    pinch(amount: number, center?: number, range?: number): NumericFunction2D;
    invert(): NumericFunction2D;
    clamp(low?: number, high?: number): NumericFunction2D;
    threshold(value: number): NumericFunction2D;
    boolThreshold(value: number): Function2D<boolean>;
}

export abstract class NumericFunction2D {
    static sum(...functions: NumericFunction2D[]): NumericFunction2D {
        return new LiteralFunction2D(p => {
            return functions.reduce((sum, fn) => sum + fn.get(p), 0);
        }).asNumeric();
    }
    static offsetSum(offset: number, ...functions: NumericFunction2D[]): NumericFunction2D {
        return new LiteralFunction2D(p => {
            return functions.reduce((sum, fn) => sum + fn.get(p) - offset, offset);
        }).asNumeric();
    }
    static product(...functions: NumericFunction2D[]): NumericFunction2D {
        return new LiteralFunction2D(p => {
            return functions.reduce((prod, fn) => prod * fn.get(p), 1);
        }).asNumeric();
    }
}

export class LiteralFunction2D<T> implements Function2D<T> {
    protected fn: (point: Point2D) => T;

    constructor(fn: (point: Point2D) => T) {
        this.fn = fn;
    }
    get(point: Point2D): T {
        return this.fn(point);
    }
    map<T2>(fn: (v: T, p: Point2D) => T2): Function2D<T2> {
        return MappedFunction2D.from(this, fn);
    }
    shiftInput(point: Point2D): Function2D<T> {
        return new LiteralFunction2D(p => this.get(p.add(point)));
    }
    mapInput(fn: (p: Point2D) => Point2D): Function2D<T> {
        return new LiteralFunction2D(p => this.get(fn(p)));
    }
    scaleInput(factor: number, center?: Point2D): Function2D<T> {
        if (center !== undefined) {
            return new LiteralFunction2D(p => this.get(p.sub(center).mult(factor).add(center)));
        } else {
            return new LiteralFunction2D(p => this.get(p.mult(factor)));
        }
    }

    asNumeric(): T extends number ? NumericFunction2D : never {
        return new NumericLiteralFunction2D(this.fn as (p: Point2D) => number) as T extends number ? NumericLiteralFunction2D : never;
    }
}

export class NumericLiteralFunction2D extends LiteralFunction2D<number> implements NumericFunction2D {
    mapNumeric(fn: (v: number, p: Point2D) => number): NumericFunction2D {
        return MappedFunction2D.from(this, fn).asNumeric();
    }
    mapInput(fn: (p: Point2D) => Point2D): NumericFunction2D {
        return super.mapInput(fn).asNumeric();
    }

    shiftInput(point: Point2D): NumericFunction2D {
        return super.shiftInput(point).asNumeric();
    }
    scaleInput(factor: number, center?: Point2D): NumericFunction2D {
        return super.scaleInput(factor, center).asNumeric();
    }
    add(v: number): NumericFunction2D {
        return this.mapNumeric(u => u + v);
    }
    multiply(factor: number, center?: number): NumericFunction2D {
        center = center ?? 0;
        return this.mapNumeric(v => center + (v-center) * factor);
    }
    pinch(amount: number, center?: number, range?: number): NumericFunction2D {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        return this.mapNumeric(v => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            return center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        });
    }
    invert(): NumericFunction2D {
        return this.mapNumeric(v => 1-v);
    }
    clamp(low?: number, high?: number): NumericFunction2D {
        low = low??0;
        high = high??1;
        return this.mapNumeric(v => Math.min(high, Math.max(low, v)));
    }
    threshold(value: number): NumericFunction2D {
        return this.mapNumeric(v => v >= value ? 1 : 0);
    }
    boolThreshold(value: number): Function2D<boolean> {
        return this.map(v => v >= value);
    }
}

export class MappedFunction2D<T> implements Function2D<T> {
    protected inner: Function2D<any>;
    protected fn: (v: any, p: Point2D) => T;

    protected constructor(inner: Function2D<any>, fn: (v: any, p: Point2D) => T) {
        this.inner = inner;
        this.fn = fn;
    }

    static from<T1, T2>(inner: Function2D<T1>, fn: (v: T1, p: Point2D) => T2): Function2D<T2> {
        return new MappedFunction2D(inner, fn);
    }

    get(point: Point2D): T {
        return this.fn(this.inner.get(point), point);
    }

    map<T2>(fn: (v: T, p: Point2D) => T2): Function2D<T2> {
        return MappedFunction2D.from(this, fn);
    }

    mapInput(fn: (p: Point2D) => Point2D): Function2D<T> {
        return new LiteralFunction2D(p => this.get(fn(p)));
    }

    shiftInput(point: Point2D): Function2D<T> {
        return new LiteralFunction2D(p => this.get(p.add(point)));
    }

    scaleInput(factor: number, center?: Point2D): Function2D<T> {
        if (center !== undefined) {
            return new LiteralFunction2D(p => this.get(p.sub(center).mult(factor).add(center)));
        } else {
            return new LiteralFunction2D(p => this.get(p.mult(factor)));
        }
    }

    asNumeric(): T extends number ? NumericFunction2D : never {
        return new NumericMappedFunction2D(this.inner, this.fn as (v: any, p: Point2D) => number) as unknown as T extends number ? NumericFunction2D : never;
    }
}

export class NumericMappedFunction2D extends MappedFunction2D<number> implements NumericFunction2D {
    mapNumeric(fn: (v: number, p: Point2D) => number): NumericFunction2D {
        return NumericMappedFunction2D.from(this, fn).asNumeric();
    }
    mapInput(fn: (p: Point2D) => Point2D): NumericFunction2D {
        return super.mapInput(fn).asNumeric();
    }

    shiftInput(point: Point2D): NumericFunction2D {
        return super.shiftInput(point).asNumeric();
    }
    scaleInput(factor: number, center?: Point2D): NumericFunction2D {
        return super.scaleInput(factor, center).asNumeric();
    }
    add(v: number): NumericFunction2D {
        return this.mapNumeric(u => u + v);
    }
    multiply(factor: number, center?: number): NumericFunction2D {
        center = center ?? 0;
        return this.mapNumeric(v => center + (v-center) * factor);
    }
    pinch(amount: number, center?: number, range?: number): NumericFunction2D {
        center = center ?? 0;
        range = range ?? 1;
        let exponent = Math.pow(Math.E, -amount);
        return this.mapNumeric(v => {
            let adjusted = v - center;
            let sign = Math.sign(adjusted);
            return center + sign*Math.pow(sign*adjusted/range, exponent)*range;
        });
    }
    invert(): NumericFunction2D {
        return this.mapNumeric(v => 1-v);
    }
    clamp(low?: number, high?: number): NumericFunction2D {
        low = low??0;
        high = high??1;
        return this.mapNumeric(v => Math.min(high, Math.max(low, v)));
    }
    threshold(value: number): NumericFunction2D {
        return this.mapNumeric(v => v >= value ? 1 : 0);
    }
    boolThreshold(value: number): Function2D<boolean> {
        return this.map(v => v >= value);
    }
}
