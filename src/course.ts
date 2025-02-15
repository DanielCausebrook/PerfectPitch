import {MersenneTwister19937, Random} from "random-js";
import {SoundEffect} from "./soundEffect";
import {generateTeeAndHolePos, generateTerrain, Matrix2D,} from "./terrainGeneration";

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
        case CellType.Water: return new CellData('hsl(210, 50%, 60%)', CellBlockType.None, true, 0, 0)
            .setLandSoundEffect(SoundEffect.water);
        case CellType.Sand: return new CellData('hsl(55, 50%, 60%)', CellBlockType.None, false, -1, 0)
            .setLandSoundEffect(SoundEffect.bunker);
        case CellType.Tree: return new CellData('hsl(120, 20%, 35%)', CellBlockType.Stick, false, 0, 0)
            .setBlockSoundEffect(SoundEffect.tree);
        case CellType.Rock: return new CellData('hsl(120, 0%, 30%)', CellBlockType.Block, false, 0, 0)
            .setBlockSoundEffect(SoundEffect.tree);
        case CellType.Hole: return new CellData('hsl(170, 60%, 45%)', CellBlockType.None, false, 0, 0);
    }
}

export class CellData {
    primaryColor: string;
    blockType: CellBlockType;
    outOfBounds: boolean;
    shotModifier: number;
    rollDistance: number;
    landSoundEffect: SoundEffect|null = null;
    blockSoundEffect: SoundEffect|null = null;

    constructor(primaryColor:string, blockType: CellBlockType, outOfBounds: boolean, shotModifier: number, landingBonus: number) {
        this.primaryColor = primaryColor;
        this.blockType = blockType;
        this.outOfBounds = outOfBounds;
        this.shotModifier = shotModifier;
        this.rollDistance = landingBonus;
    }

    setLandSoundEffect(effect: SoundEffect): this {
        this.landSoundEffect = effect;
        return this;
    }
    setBlockSoundEffect(effect: SoundEffect): this {
        this.blockSoundEffect = effect;
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
    #layout: Matrix2D<CellType>;
    #holePos: Position;
    #teePos: Position;

    constructor(layout: Matrix2D<CellType>, holePos: Position, teePos: Position) {
        this.#layout = layout;
        this.#holePos = holePos;
        this.#teePos = teePos;
    }

    static generate(width: number, height: number, xEdge: number, yEdge: number, rng: Random): Course {
        let [teePos, holePos] = generateTeeAndHolePos(width, height, xEdge, yEdge, new Random(MersenneTwister19937.seed(rng.uint32())));
        let map = generateTerrain(width, height, xEdge, yEdge, teePos,  holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

        return new Course(map, holePos, teePos);
    }

    height(): number {
        return this.#layout.height;
    }

    width(): number {
        return this.#layout.width;
    }

    cell(position: Position): CellType {
        return this.#layout.data[position[0]][position[1]];
    }

    tee(): Position {
        return this.#teePos;
    }

    isValidPosition(position: Position): boolean {
        const x = position[0];
        const y = position[1];
        return x >= 0 && y >= 0 && x < this.width() && y < this.height();
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