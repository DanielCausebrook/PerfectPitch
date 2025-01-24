import {CellType} from "./course";

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
    #canUseOn: CellType[];

    constructor(diceFaces: number[], bounces: boolean, noStick:boolean, canUseOn: CellType[]) {
        this.#diceFaces = diceFaces;
        this.#bounces = bounces;
        this.#noStick = noStick;
        this.#canUseOn = canUseOn;
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
    cellTypes(): CellType[] {
        return this.#canUseOn;
    }
    canUseOn(cellType: CellType): boolean {
        return this.#canUseOn.includes(cellType);
    }
}

export function getClubData(clubType: ClubType) {
    switch (clubType) {
        case ClubType.Putter: return new ClubData([1, 1, 1, 1, 2], false, false, [CellType.Fairway]);
        case ClubType.Iron: return new ClubData([1, 2, 3, 3, 4], true, false, [CellType.Fairway, CellType.Rough, CellType.Tree]);
        case ClubType.Driver: return new ClubData([3, 4, 5, 6], true, false, [CellType.Fairway, CellType.Rough]);
        case ClubType.Wedge: return new ClubData([1, 2, 2, 2, 3], false, true, [CellType.Fairway, CellType.Rough, CellType.Sand, CellType.Tree]);
    }
}

export class Player {
    position: [number, number];
    #strokesTaken: number = 0;

    constructor(position: [number, number]) {
        this.position = position;
    }
}