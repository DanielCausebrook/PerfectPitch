import {MersenneTwister19937, Random} from "random-js";
import {SoundEffect} from "../soundEffect";
import {generateTeeAndHolePos, generateTerrain} from "../terrainGeneration";
import {type Point2D, RectPoint2D} from "$lib/maths/point2D";
import {
    RectRegion2D,
    type Region2D,
    type Tiling2D
} from "$lib/maths/tiling2D";

export enum CellType {
    Flag,
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
        case CellType.Flag: return new CellData('hsl(170, 60%, 45%)', CellBlockType.None, false, 0, 0);
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

export class Hole<R extends Region2D> {
    readonly bounds: R;
    readonly map: Tiling2D<R, CellType>;
    readonly teePos: Point2D;
    readonly flagPos: Point2D;
    readonly par: number;

    constructor(map: Tiling2D<R, CellType>, teePos: Point2D, holePos: Point2D, par: number) {
        this.map = map;
        this.bounds = map.bounds;
        this.teePos = teePos;
        this.flagPos = holePos;
        this.par = par;
    }

    static generate(width: number, height: number, xEdge: number, yEdge: number, rng: Random): Hole<RectRegion2D> {
        let [teePos, flagPos] = generateTeeAndHolePos(width, height, xEdge, yEdge, new Random(MersenneTwister19937.seed(rng.uint32())));
        return generateTerrain(width, height, teePos, flagPos, new Random(MersenneTwister19937.seed(rng.uint32())));
    }

    cell(position: Point2D): CellType {
        return this.map.get(position);
    }
}