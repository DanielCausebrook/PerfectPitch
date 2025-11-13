import {CellType, moveInDirection} from "./course";
import {SoundEffect} from "./soundEffect";
import {type Icon, IconArrowBigRight, IconCone, IconDiamonds, IconPoint} from "@tabler/icons-svelte";
import {MersenneTwister19937, Random} from "random-js";

export enum ClubType {
    Putter,
    Iron,
    Driver,
    Wedge,
}

export class Club {
    readonly type: ClubType;
    #name: string;
    #icon: Icon;
    #diceFaces: number[];
    #sliceFrom: number;
    #bounces: boolean = true;
    #sticks: boolean = true;
    #noShotModifier: boolean = false;
    #canUseOn: CellType[];
    #defaultSoundEffect: SoundEffect;
    #soundEffectOverrides: Map<CellType, SoundEffect> = new Map();

    constructor(type: ClubType, name: string, icon: Icon, diceFaces: number[], sliceFrom: number, canUseOn: CellType[], defaultSoundEffect: SoundEffect) {
        this.type = type;
        this.#name = name;
        this.#icon = icon;
        this.#diceFaces = diceFaces;
        this.#sliceFrom = sliceFrom;
        this.#canUseOn = canUseOn;
        this.#defaultSoundEffect = defaultSoundEffect;
    }
    name(): string {
        return this.#name;
    }
    icon(): Icon {
        return this.#icon;
    }
    diceFaces(): number[] {
        return this.#diceFaces;
    }
    sliceFrom(): number {
        return this.#sliceFrom;
    }
    setBounces(bounces: boolean): this {
        this.#bounces = bounces;
        return this;
    }
    bounces(): boolean {
        return this.#bounces;
    }
    setSticks(sticks: boolean): this {
        this.#sticks = sticks;
        return this;
    }
    sticks(): boolean {
        return this.#sticks;
    }
    setNoShotModifier(noShotModifier: boolean): this {
        this.#noShotModifier = noShotModifier;
        return this;
    }
    noShotModifier(): boolean {
        return this.#noShotModifier;
    }
    cellTypes(): CellType[] {
        return this.#canUseOn;
    }
    canUseOn(cellType: CellType): boolean {
        return this.#canUseOn.includes(cellType);
    }
    overrideSoundEffect(cellType: CellType, audio: SoundEffect): this {
        this.#soundEffectOverrides.set(cellType, audio);
        return this;
    }
    soundEffect(cellType: CellType): SoundEffect {
        return this.#soundEffectOverrides.get(cellType) ?? this.#defaultSoundEffect;
    }
    createRandom(rng: Random): RandomClubStatus {
        return new RandomClubStatus(this, rng);
    }
    createSequential(rng: Random, rerollLockout: number): SequentialClubStatus {
        return new SequentialClubStatus(this, rng, rerollLockout);
    }
}

export const clubs = new Map([
    new Club(ClubType.Putter, 'Putter', IconPoint, [1, 1, 1, 2], 5, [CellType.Fairway], SoundEffect.putter)
        .setBounces(false)
        .setNoShotModifier(true),
    new Club(ClubType.Wedge, 'Wedge', IconCone, [1, 2, 3, 3], 5, [CellType.Fairway, CellType.Rough, CellType.Tree, CellType.Sand], SoundEffect.wedge)
        .setBounces(false)
        .setSticks(false)
        .overrideSoundEffect(CellType.Sand, SoundEffect.sandWedge),
    new Club(ClubType.Iron, 'Iron', IconDiamonds, [2, 3, 4, 5], 5, [CellType.Fairway, CellType.Rough, CellType.Tree], SoundEffect.iron),
    new Club(ClubType.Driver, 'Driver', IconArrowBigRight, [3, 4, 5, 6], 5, [CellType.Fairway, CellType.Rough], SoundEffect.driver),
].map(c => [c.type, c]));

export function getClub(clubType: ClubType): Club {
    return clubs.get(clubType) as Club;
}

export enum ClubBehaviour {
    Random,
    Sequential,
}

export interface ClubStatus {
    faces(): number[];
    next(): {distance: number, sliceValues: (-1|0|1)[]}|null;
    isAvailable(): boolean;
    shotPreviewHighlights(): string[];
}

export class SequentialClubStatus implements ClubStatus {
    #faces: number[];
    #nextIndex: number|null = 0;
    #rerollLockoutRemaining: number|null = null;
    private readonly rerollRng: Random;
    private readonly sliceRng: Random;
    private readonly rerollLockout: number;
    private readonly sliceFrom: number;

    constructor(club: Club, rng: Random, rerollLockout: number) {
        this.#faces = club.diceFaces();
        this.rerollRng = new Random(MersenneTwister19937.seed(rng.uint32()));
        this.sliceRng = new Random(MersenneTwister19937.seed(rng.uint32()));
        this.rerollLockout = rerollLockout;
        this.sliceFrom = club.sliceFrom();
        this.shuffle();
    }

    faces(): number[] {
        return this.#faces;
    }

    nextFaceIndex(): number|null {
        return this.#nextIndex;
    }

    next(): {distance: number, sliceValues: (-1|0|1)[]}|null {
        if (this.#nextIndex === null) {
            return null;
        }
        let distance = this.#faces[this.#nextIndex];
        this.#nextIndex++;
        if (this.#nextIndex >= this.#faces.length) {
            this.#nextIndex = null;
            this.#rerollLockoutRemaining = this.rerollLockout;
        }
        let slice: (-1|0|1)[] = [];
        for (let i = 0; i < distance; i++) {
            slice.push(this.sliceRng.pick([-1, 0, 1]));
        }
        return {distance: distance, sliceValues: slice};
    }

    advanceLockout() {
        if (this.#rerollLockoutRemaining !== null && this.#rerollLockoutRemaining > 0) {
            this.#rerollLockoutRemaining--;
        }
    }

    peekNext(): number|null {
        return this.#nextIndex !== null ? this.#faces[this.#nextIndex] : null;
    }

    isAvailable(): boolean {
        return this.peekNext() !== null;
    }

    lockoutLeft(): number|null {
        return this.#rerollLockoutRemaining;
    }

    shuffle(): void {
        this.#faces = this.rerollRng.shuffle(this.#faces);
        this.#nextIndex = 0;
        this.#rerollLockoutRemaining = null;
    }

    shotPreviewHighlights(): string[] {
        let nextMoveDistance = this.peekNext();
        if (nextMoveDistance === null) {
            return [];
        }
        let highlights: string[] = [];
        for (let i = 0; i <= nextMoveDistance; i++) {
            let color = i >= this.sliceFrom ? 'hsl(20, 60%, 70%)' : 'hsl(0, 0%, 100%)';
            highlights.push(color);
        }
        return highlights;
    }
}

export class RandomClubStatus implements ClubStatus {
    #faces: number[];
    readonly #shotPreviewHighlights: string[];
    private readonly faceRng: Random;
    private readonly sliceRng: Random;

    constructor(club: Club, rng: Random) {
        this.#faces = club.diceFaces().slice().reverse();
        this.faceRng = new Random(MersenneTwister19937.seed(rng.uint32()));
        this.sliceRng = new Random(MersenneTwister19937.seed(rng.uint32()));

        let maxShot = this.#faces.reduce((max: number|null, next) => max === null ? next : Math.max(max, next), null) ?? 0;

        let highlights: string[] = [];
        for (let i = 0; i <= maxShot; i++) {
            let numFacesForI = this.#faces.filter(f => f >= i).length;
            let probability = numFacesForI / this.#faces.length;
            let opacity = 0.3 + 0.7*Math.pow(probability, 1/2);
            let sliceOpacity = 0.3 + 0.7*Math.pow(probability, 1/2);
            highlights.push((i >= club.sliceFrom()) ? `hsl(20, 100%, 80%, ${sliceOpacity*100}%)` : `hsl(0, 0%, 100%, ${opacity*100}%)`);
        }
        this.#shotPreviewHighlights = highlights;
    }

    faces(): number[] {
        return this.#faces;
    }

    next(): {distance: number, sliceValues: (-1|0|1)[]}|null {
        let distance = this.faceRng.pick(this.#faces);

        let slice: (-1|0|1)[] = [];
        for (let i = 0; i < distance; i++) {
            slice.push(this.sliceRng.pick([-1, 0, 1]));
        }

        return {distance: distance, sliceValues: slice};
    }

    isAvailable(): boolean {
        return true;
    }

    shotPreviewHighlights(): string[] {
        return this.#shotPreviewHighlights;
    }
}