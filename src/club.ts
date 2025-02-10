import {CellType} from "./course";
import {SoundEffect} from "./soundEffect";
import {type Icon, IconArrowBigRight, IconCone, IconDiamonds, IconPoint} from "@tabler/icons-svelte";

export enum ClubType {
    Putter,
    Iron,
    Driver,
    Wedge,
}

export class ClubData {
    #name: string;
    #icon: Icon;
    #diceFaces: number[];
    #bounces: boolean = true;
    #sticks: boolean = true;
    #noShotModifier: boolean = false;
    #canUseOn: CellType[];
    #defaultSoundEffect: SoundEffect;
    #soundEffectOverrides: Map<CellType, SoundEffect> = new Map();

    constructor(name: string, icon: Icon, diceFaces: number[], canUseOn: CellType[], defaultSoundEffect: SoundEffect) {
        this.#name = name;
        this.#icon = icon;
        this.#diceFaces = diceFaces;
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

export function getClubData(clubType: ClubType) {
    switch (clubType) {
        case ClubType.Putter: return new ClubData('Putter', IconPoint, [1, 1, 1, 1, 2], [CellType.Fairway], SoundEffect.putter)
            .setBounces(false)
            .setNoShotModifier(true);
        case ClubType.Wedge: return new ClubData('Wedge', IconCone, [1, 2, 2, 3, 3], [CellType.Fairway, CellType.Rough, CellType.Tree, CellType.Sand], SoundEffect.wedge)
            .setBounces(false)
            .setSticks(false)
            .overrideSoundEffect(CellType.Sand, SoundEffect.sandWedge);
        case ClubType.Iron: return new ClubData('Iron', IconDiamonds, [3, 3, 4, 4, 5], [CellType.Fairway, CellType.Rough, CellType.Tree], SoundEffect.iron);
        case ClubType.Driver: return new ClubData('Driver', IconArrowBigRight, [4, 5, 6, 7, 8], [CellType.Fairway, CellType.Rough], SoundEffect.driver);
    }
}

