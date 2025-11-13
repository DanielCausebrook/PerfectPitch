import {MersenneTwister19937, Random} from "random-js";
import {SoundEffect} from "./soundEffect";
import {generateTeeAndHolePos, generateTerrain} from "./terrainGeneration";
import {RectPoint, TiledRectRegion, RectRegion} from "./geometry";

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

export class Course {
    #layout: TiledRectRegion<CellType>;
    #holePos: RectPoint;
    #teePos: RectPoint;

    constructor(layout: TiledRectRegion<CellType>, holePos: RectPoint, teePos: RectPoint) {
        this.#layout = layout;
        this.#holePos = holePos;
        this.#teePos = teePos;
    }

    static generate(width: number, height: number, xEdge: number, yEdge: number, rng: Random): Course {
        let [teePos, holePos] = generateTeeAndHolePos(width, height, xEdge, yEdge, new Random(MersenneTwister19937.seed(rng.uint32())));
        let map = generateTerrain(width, height, xEdge, yEdge, teePos,  holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

        return new Course(map, holePos, teePos);
    }

    bounds(): RectRegion {
        return this.#layout.bounds;
    }

    height(): number {
        return this.#layout.bounds.height;
    }

    width(): number {
        return this.#layout.bounds.width;
    }

    cell(position: RectPoint): CellType {
        return this.#layout.get(position);
    }

    tee(): RectPoint {
        return this.#teePos;
    }

    isValidPosition(position: RectPoint): boolean {
        return this.#layout.bounds.contains(position);
    }
}