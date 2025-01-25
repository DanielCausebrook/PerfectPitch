import {createNoise2D} from "simplex-noise";
import {type Engine, MersenneTwister19937, pick, real} from "random-js";
import {SoundEffect} from "./soundEffect";

export type Position = [number, number];

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
        case CellType.Fairway: return new CellData('hsl(90, 60%, 40%)', CellBlockType.None, false, 0, 1);
        case CellType.Rough: return new CellData('hsl(100, 60%, 35%)', CellBlockType.None, false, 0, 0);
        case CellType.Water: return new CellData('hsl(210, 50%, 60%)', CellBlockType.None, true, 0, 0).setSoundEffect(SoundEffect.water);
        case CellType.Sand: return new CellData('hsl(55, 50%, 60%)', CellBlockType.None, false, -1, 0).setSoundEffect(SoundEffect.bunker);
        case CellType.Tree: return new CellData('hsl(120, 20%, 35%)', CellBlockType.Stick, false, 0, 0).setSoundEffect(SoundEffect.tree);
        case CellType.Rock: return new CellData('hsl(120, 0%, 30%)', CellBlockType.Block, false, 0, 0);
        case CellType.Hole: return new CellData('hsl(170, 60%, 45%)', CellBlockType.None, false, 0, 0);
    }
}

export class CellData {
    primaryColor: string;
    blockType: CellBlockType;
    outOfBounds: boolean;
    shotModifier: number;
    rollDistance: number;
    soundEffect: SoundEffect|null = null;

    constructor(primaryColor:string, blockType: CellBlockType, outOfBounds: boolean, shotModifier: number, landingBonus: number) {
        this.primaryColor = primaryColor;
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
    #holePos: Position;
    #teePos: Position;

    constructor(height: number, width: number, layout: CellType[][], holePos: Position, teePos: Position) {
        this.#height = height;
        this.#width = width;
        this.#layout = layout;
        this.#holePos = holePos;
        this.#teePos = teePos;
    }

    static generate(width: number, height: number, rng: Engine): Course|null {
        let terrain = this.#generateTerrain(width, height, MersenneTwister19937.seed(rng.next()));
        let holePos = this.#generateHolePos(width, height, terrain, MersenneTwister19937.seed(rng.next()));
        if (holePos === null) {
            return null;
        }
        terrain[holePos[0]][holePos[1]] = CellType.Hole;

        let teePos = this.#generateTeePos(width, height, terrain, holePos, MersenneTwister19937.seed(rng.next()));
        if (teePos === null) {
            return null;
        }

        return new Course(height, width, terrain, holePos, teePos);
    }

    static #generateTerrain(width: number, height: number, rng: Engine): CellType[][] {
        function genSimple(scale: number, threshold: number): (pos: Position) => boolean {
            const noise = createNoise2D(() => real(0, 1)(rng));
            return (pos: Position) => noise(pos[0]/scale, pos[1]/scale) >= threshold
        }
        // const waterNoise = genSimple(10, 0.45);
        const waterNoise2D = createNoise2D(() => real(0, 1)(rng));
        const waterNoise = (pos: Position) => {
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

        const getCell = (position: Position) => {
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
        let terrain = Array(width);
        for (let x = 0; x < width; x++) {
            terrain[x] = Array(height);
            for (let y = 0; y < height; y++) {
                terrain[x][y] = getCell([x, y]);
            }
        }
        return terrain;
    }

    static #generateHolePos(width: number, height: number, terrain: CellType[][], rng: Engine): Position|null {
        let fairwayDensity = Array(width * height).fill(0);
        const incrementIfExists = (x: number, y: number) => {
            if (x >= 0 && y >= 0 && x < width && y < height) {
                fairwayDensity[x*width + y]++;
            }
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (terrain[x][y] == CellType.Fairway) {
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
        let maxAt: Position[] = [];
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
        return pick(rng, maxAt);
    }

    static #generateTeePos(width: number, height: number, terrain: CellType[][], holePos: Position, rng: Engine): Position|null {
        let fairwayPositions: Position[] = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const distanceFromHole = Math.max(Math.abs(holePos[0] - x), Math.abs(holePos[1] - y));
                const minDist = Math.max(width, height) / 3;
                if (terrain[x][y] === CellType.Fairway && distanceFromHole > minDist) {
                    fairwayPositions.push([x, y]);
                }
            }
        }
        if (fairwayPositions.length === 0) {
            return null;
        }
        return pick(rng, fairwayPositions);
    }

    height(): number {
        return this.#height;
    }

    width(): number {
        return this.#width;
    }

    cell(position: Position): CellType {
        return this.#layout[position[0]][position[1]];
    }

    tee(): Position {
        return this.#teePos;
    }

    isValidPosition(position: Position): boolean {
        const x = position[0];
        const y = position[1];
        return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
    }
}

export function moveInDirection(position: Position, direction: Direction): Position {
    switch (direction) {
        case Direction.N: return [position[0], position[1] + 1];
        case Direction.NE: return [position[0] + 1, position[1] + 1];
        case Direction.E: return [position[0] + 1, position[1]];
        case Direction.SE: return [position[0] + 1, position[1] - 1];
        case Direction.S: return [position[0], position[1] - 1];
        case Direction.SW: return [position[0] - 1, position[1] - 1];
        case Direction.W: return [position[0] - 1, position[1]];
        case Direction.NW: return [position[0] - 1, position[1] + 1];
    }
}

export function rotateDirection(direction: Direction, angle: number): Direction {
    return (((direction + angle) % 8) + 8) % 8;
}