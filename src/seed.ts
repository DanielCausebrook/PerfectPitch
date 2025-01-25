
// Use 23456789CFGHJMPQRVWX for readability
import {MersenneTwister19937} from "random-js";

const seedMin = -2147483648;
const seedStringMapping = [['0', 'M'], ['1', 'P'], ['a', 'Q'], ['b', 'R'], ['d', 'V'], ['e', 'W'], ['i', 'X']];
export function seedToSeedId(seed: number): string {
    let str = (seed - seedMin).toString(20);

    for (const [from, to] of seedStringMapping) {
        str = str.replaceAll(from, to);
    }
    return str.toUpperCase();
}

export function seedFromSeedId(seedId: string): number {
    let str = seedId;
    if (str.match(/[23456789CFGHJMPQRVWX]/) === null) {
        throw new Error("Invalid seed id");
    }
    for (const [to, from] of seedStringMapping) {
        str = str.replaceAll(from, to);
    }
    return Number.parseInt(str, 20) + seedMin;
}

export async function seedFromString(str: string): Promise<number> {
    let hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    let int32Array = Array.from(new Int32Array(hash, 0, 1));
    return int32Array[0];
}

export function randomSeed(): number {
    return MersenneTwister19937.autoSeed().next();
}