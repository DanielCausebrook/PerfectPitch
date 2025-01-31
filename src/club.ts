import {CellType} from "./course";
import {SoundEffect} from "./soundEffect";

export enum ClubType {
    Putter,
    Iron,
    Driver,
    Wedge,
}

export class ClubData {
    #diceFaces: number[];
    #bounces: boolean;
    #noStick: boolean;
    #noShotModifier: boolean;
    #canUseOn: CellType[];
    #defaultSoundEffect: SoundEffect;
    #soundEffectOverrides: Map<CellType, SoundEffect> = new Map();

    constructor(diceFaces: number[], bounces: boolean, noStick:boolean, noShotModifier: boolean, canUseOn: CellType[], defaultSoundEffect: SoundEffect) {
        this.#diceFaces = diceFaces;
        this.#bounces = bounces;
        this.#noStick = noStick;
        this.#noShotModifier = noShotModifier;
        this.#canUseOn = canUseOn;
        this.#defaultSoundEffect = defaultSoundEffect;
    }

    diceFaces(): number[] {
        return this.#diceFaces;
    }
    allowsRolls(): boolean {
        return this.#bounces;
    }
    noStick(): boolean {
        return this.#noStick;
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
        case ClubType.Putter: return new ClubData([1, 1, 1, 1, 2], false, false, true, [CellType.Fairway], SoundEffect.putter);
        case ClubType.Wedge: return new ClubData([1, 2, 2, 3, 3], false, true, false, [CellType.Fairway, CellType.Rough, CellType.Tree, CellType.Sand], SoundEffect.wedge)
            .overrideSoundEffect(CellType.Sand, SoundEffect.sandWedge);
        case ClubType.Iron: return new ClubData([3, 3, 4, 4, 5], true, false, false, [CellType.Fairway, CellType.Rough, CellType.Tree], SoundEffect.iron);
        case ClubType.Driver: return new ClubData([4, 5, 6, 7, 8], true, false, false, [CellType.Fairway, CellType.Rough], SoundEffect.driver);
    }
}

