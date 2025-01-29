import {MersenneTwister19937, Random} from "random-js";
import {SoundEffect} from "./soundEffect";
import {
    buildMap,
    gaussianBlur,
    generateTeeAndHolePos, generateTerrain,
    generateTerrainDebug,
    loopErasedRandomWalk,
    ValMapBuilder
} from "./terrainGeneration";

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

    static generate(width: number, height: number, rng: Random): Course {
        let [teePos, holePos] = generateTeeAndHolePos(width, height, new Random(MersenneTwister19937.seed(rng.uint32())));
        let map = generateTerrain(width, height, teePos,  holePos, new Random(MersenneTwister19937.seed(rng.uint32())));

        return new Course(height, width, map, holePos, teePos);
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

export function getUnitVector(direction: Direction): Position {
    switch (direction) {
        case Direction.N:  return [ 0,  1];
        case Direction.NE: return [ 1,  1];
        case Direction.E:  return [ 1,  0];
        case Direction.SE: return [ 1, -1];
        case Direction.S:  return [ 0, -1];
        case Direction.SW: return [-1, -1];
        case Direction.W:  return [-1,  0];
        case Direction.NW: return [-1,  1];
    }
}

class CellAnimationComponent {
    #keyframes: Keyframe[];
    #durationMs: number;
    #onGlowElement: boolean;

    constructor(keyframes: Keyframe[], durationMs: number, onGlowElement?: boolean) {
        this.#keyframes = keyframes;
        this.#durationMs = durationMs;
        this.#onGlowElement = onGlowElement ?? false;
    }

    play(cell: HTMLElement) {
        if (this.#onGlowElement) {
            cell.querySelector('.glow-element')?.animate(this.#keyframes, {
                duration: this.#durationMs,
                iterations: 1,
            });
        } else {
            cell.animate(this.#keyframes, {
                duration: this.#durationMs,
                iterations: 1,
            });
        }
    }
}

export class CellAnimation {
    #components: CellAnimationComponent[];

    constructor(components: CellAnimationComponent[]) {
        this.#components = components;
    }

    play(cell: HTMLElement) {
        for (const component of this.#components) {
            component.play(cell);
        }
    }

    static #rotationAxis(direction: Direction) {
        return getUnitVector(rotateDirection(direction, 2));
    }

    static combine(...animations: CellAnimation[]): CellAnimation {
        return new CellAnimation(animations.reduce((combined, animation) => {
            combined.push(...animation.#components);
            return combined;
        }, [] as CellAnimationComponent[]));
    }

    static glow(color: string, spread: number, durationMs: number): CellAnimation {
        return new CellAnimation([
            new CellAnimationComponent([
                {boxShadow: `0 0 ${spread}px ${spread/2}px transparent`, easing: 'ease-out'},
                {boxShadow: `0 0 ${spread}px ${spread/2}px ${color}`, easing: 'ease-in', offset: 0.02},
                {boxShadow: `0 0 ${spread}px ${spread/2}px transparent`},
            ], durationMs, true),
        ]);
    }

    static wobble(direction: Direction, initialRotation: number, durationMs: number): CellAnimation {
        const strikeOffset = 0.05;
        const decay = 0.625;
        const numWobbles = 6;
        const axis = this.#rotationAxis(direction);
        let animation: Keyframe[] = [
            {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`, easing: 'ease-out'},
            {
                transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${initialRotation}deg)`,
                offset: strikeOffset,
                easing: `cubic-bezier(.42,0,.58,1)`,
            },
        ];
        for (let i = 1; i < numWobbles; i++) {
            animation.push({
                transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${initialRotation*Math.pow(-decay, i)}deg)`,
                offset: strikeOffset + i*(1-strikeOffset)/numWobbles,
                easing: `cubic-bezier(.42,0,.58,1)`,
            });
        }
        animation.push({transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`})
        return new CellAnimation([
            new CellAnimationComponent(animation, durationMs),
        ])
    }

    static spin(direction: Direction, durationMs: number): CellAnimation {
        let axis = this.#rotationAxis(direction);
        return new CellAnimation([
            new CellAnimationComponent([
                {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`, easing: 'cubic-bezier(0, 0.2, 0, 1)'},
                {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${360*4}deg)`},
            ], durationMs),
        ])
    }
}