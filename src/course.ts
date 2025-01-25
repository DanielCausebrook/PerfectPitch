import {createNoise2D, type NoiseFunction2D} from "simplex-noise";
import {Player} from "./player";
import {type Engine, MersenneTwister19937, pick, real} from "random-js";
import {SoundEffect} from "./soundEffect";

export enum CellType {
    Hole,
    Fairway,
    Rough,
    Water,
    Sand,
    Tree,
    Rock,
}

export enum CellBlockType {
    None,
    Stick,
    Block,
}

export function getCellData(cellType: CellType): CellData {
    switch (cellType) {
        case CellType.Fairway: return new CellData(CellBlockType.None, false, 0, 1);
        case CellType.Rough: return new CellData(CellBlockType.None, false, 0, 0);
        case CellType.Water: return new CellData(CellBlockType.None, true, 0, 0).setSoundEffect(SoundEffect.water);
        case CellType.Sand: return new CellData(CellBlockType.None, false, -1, 0).setSoundEffect(SoundEffect.bunker);
        case CellType.Tree: return new CellData(CellBlockType.Stick, false, 0, 0).setSoundEffect(SoundEffect.tree);
        case CellType.Rock: return new CellData(CellBlockType.Block, false, 0, 0);
        case CellType.Hole: return new CellData(CellBlockType.None, false, 0, 0);
    }
}

export class CellData {
    blockType: CellBlockType;
    outOfBounds: boolean;
    shotModifier: number;
    rollDistance: number;
    soundEffect: SoundEffect|null = null;

    constructor(blockType: CellBlockType, outOfBounds: boolean, shotModifier: number, landingBonus: number) {
        this.blockType = blockType;
        this.outOfBounds = outOfBounds;
        this.shotModifier = shotModifier;
        this.rollDistance = landingBonus;
    }

    setSoundEffect(effect: SoundEffect): this {
        this.soundEffect = effect;
        return this;
    }
}

export enum Direction {
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW,
}

export class Course {
    #height: number;
    #width: number;
    #layout: CellType[][];
    #holePos: [number, number];

    constructor(height: number, width: number, layout: CellType[][], holePos: [number, number]) {
        this.#height = height;
        this.#width = width;
        this.#layout = layout;
        this.#holePos = holePos;
    }

    static generate(width: number, height: number, rng: Engine): Course|null {
        let terrainRng = MersenneTwister19937.seed(rng.next());
        function genSimple(scale: number, threshold: number): (pos: [number, number]) => boolean {
            const noise = createNoise2D(() => real(0, 1)(terrainRng));
            return (pos: [number, number]) => noise(pos[0]/scale, pos[1]/scale) >= threshold
        }
        // const waterNoise = genSimple(10, 0.45);
        const waterNoise2D = createNoise2D(() => real(0, 1)(terrainRng));
        const waterNoise = (pos: [number, number]) => {
            let edgeProximity = 0;
            if (pos[0] <= 2) {
                edgeProximity += Math.pow(3 - pos[0], 1.5);
            }
            if (pos[0] >= width-3) {
                edgeProximity += Math.pow(pos[0] - (width - 4), 1.5);
            }
            if (pos[1] <= 2) {
                edgeProximity += Math.pow(3 - pos[1], 1.5);
            }
            if (pos[1] >= height-3) {
                edgeProximity += Math.pow(pos[1] - (height - 4), 1.5);
            }
            const val = waterNoise2D(pos[0]/10, pos[1]/10) + edgeProximity * 0.1;
            return val >= 0.45;
        }
        const fairwayNoise = genSimple(8, 0.5);
        const fairwayNoise2 = genSimple(8, 0.52);
        const treeNoise = genSimple(6, 0.6);
        const treeNoise2a = genSimple(2, 0.45);
        const treeNoise2b = genSimple(2, 0.45);
        const rockNoise = genSimple(10, 0.55);
        const sandNoise = genSimple(10, 0.7);
        const sandNoise2 = genSimple(10, 0.7);

        const getCell = (position: [number, number]) => {
            switch (true) {
                case waterNoise(position): return CellType.Water;
                case rockNoise(position): return CellType.Rock;
                case sandNoise(position): return CellType.Sand;
                case fairwayNoise2(position): return CellType.Fairway;
                case treeNoise2b(position): return CellType.Tree;
                case fairwayNoise(position): return CellType.Fairway;
                case treeNoise2a(position): return CellType.Tree;
                case sandNoise2(position): return CellType.Sand;
                case treeNoise(position): return CellType.Tree;
                default: return CellType.Rough;
            }
        };
        let layout = Array(width);
        for (let x = 0; x < width; x++) {
            layout[x] = Array(height);
            for (let y = 0; y < height; y++) {
                layout[x][y] = getCell([x, y]);
            }
        }
        let fairwayDensity = Array(width * height).fill(0);
        const incrementIfExists = (x: number, y: number) => {
            if (x >= 0 && y >= 0 && x < width && y < height) {
                fairwayDensity[x*width + y]++;
            }
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (layout[x][y] == CellType.Fairway) {
                    incrementIfExists(x-1, y-1);
                    incrementIfExists(x-1, y);
                    incrementIfExists(x-1, y+1);
                    incrementIfExists(x, y-1);
                    incrementIfExists(x, y);
                    incrementIfExists(x, y+1);
                    incrementIfExists(x+1, y-1);
                    incrementIfExists(x+1, y);
                    incrementIfExists(x+1, y+1);
                }
            }
        }
        let maxAt: [number, number][] = [];
        let max = 0;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const density = fairwayDensity[x*width + y];
                if (density > max) {
                    max = density;
                    maxAt = [[x, y]];
                } else if (density == max) {
                    maxAt.push([x, y]);
                }
            }
        }
        if (maxAt.length === 0) {
            return null;
        }
        let holePos = pick(rng, maxAt);
        layout[holePos[0]][holePos[1]] = CellType.Hole;
        return new Course(height, width, layout, holePos);
    }

    createPlayer(rng: Engine): Player|null {
        let fairwayPositions: [number, number][] = [];
        for (let x = 0; x < this.#width; x++) {
            for (let y = 0; y < this.#height; y++) {
                const distanceFromHole = Math.max(Math.abs(this.#holePos[0] - x), Math.abs(this.#holePos[1] - y));
                const minDist = Math.max(this.#width, this.#height) / 3;
                if (this.cell([x, y]) === CellType.Fairway && distanceFromHole > minDist) {
                    fairwayPositions.push([x, y]);
                }
            }
        }
        if (fairwayPositions.length === 0) {
            return null;
        }
        let pos = pick(rng, fairwayPositions);
        return new Player(pos);
    }

    height(): number {
        return this.#height;
    }

    width(): number {
        return this.#width;
    }

    cell(position: [number, number]): CellType {
        return this.#layout[position[0]][position[1]];
    }

    isValidPosition(position: [number, number]): boolean {
        const x = position[0];
        const y = position[1];
        return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
    }
}

export function moveInDirection(position: [number, number], direction: Direction): [number, number] {
    switch (direction) {
        case Direction.N: return [position[0], position[1] - 1];
        case Direction.NE: return [position[0] + 1, position[1] - 1];
        case Direction.E: return [position[0] + 1, position[1]];
        case Direction.SE: return [position[0] + 1, position[1] + 1];
        case Direction.S: return [position[0], position[1] + 1];
        case Direction.SW: return [position[0] - 1, position[1] + 1];
        case Direction.W: return [position[0] - 1, position[1]];
        case Direction.NW: return [position[0] - 1, position[1] - 1];
    }
}

export function rotateDirection(direction: Direction, angle: number): Direction {
    return (((direction + angle) % 8) + 8) % 8;
}