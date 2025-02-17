import {CellType} from "./course";
import {SoundEffect} from "./soundEffect";
import {type Icon, IconArrowBigRight, IconCone, IconDiamonds, IconPoint} from "@tabler/icons-svelte";

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
}

export const clubs = new Map([
    new Club(ClubType.Putter, 'Putter', IconPoint, [1, 1, 1, 1, 2], 4, [CellType.Fairway], SoundEffect.putter)
        .setBounces(false)
        .setNoShotModifier(true),
    new Club(ClubType.Wedge, 'Wedge', IconCone, [1, 1, 2, 2, 3], 4, [CellType.Fairway, CellType.Rough, CellType.Tree, CellType.Sand], SoundEffect.wedge)
        .setBounces(false)
        .setSticks(false)
        .overrideSoundEffect(CellType.Sand, SoundEffect.sandWedge),
    new Club(ClubType.Iron, 'Iron', IconDiamonds, [2, 3, 3, 4, 5], 4, [CellType.Fairway, CellType.Rough, CellType.Tree], SoundEffect.iron),
    new Club(ClubType.Driver, 'Driver', IconArrowBigRight, [3, 4, 5, 5, 6], 4, [CellType.Fairway, CellType.Rough], SoundEffect.driver),
].map(c => [c.type, c]));

export function getClub(clubType: ClubType): Club {
    return clubs.get(clubType) as Club;
}