import {CellType} from "./course";

export enum ClubType {
    Putter,
    Iron,
    Driver,
    Wedge,
}

export class ClubData {
    #diceFaces: number[];
    #allowRolls: boolean;
    #canUseOn: CellType[];

    constructor(diceFaces: number[], rollsOnGreen: boolean, canUseOn: CellType[]) {
        this.#diceFaces = diceFaces;
        this.#allowRolls = rollsOnGreen;
        this.#canUseOn = canUseOn;
    }

    diceFaces(): number[] {
        return this.#diceFaces;
    }
    allowsRolls(): boolean {
        return this.#allowRolls;
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
        case ClubType.Putter: return new ClubData([1, 1, 1, 1, 2], false, [CellType.Fairway]);
        case ClubType.Iron: return new ClubData([1, 2, 3, 3, 4], true, [CellType.Fairway, CellType.Rough, CellType.Tree]);
        case ClubType.Driver: return new ClubData([3, 4, 5, 6], true, [CellType.Fairway, CellType.Rough]);
        case ClubType.Wedge: return new ClubData([0, 1, 1, 2], false, [CellType.Fairway, CellType.Rough, CellType.Sand, CellType.Tree]);
    }
}

export class Player {
    position: [number, number];
    #strokesTaken: number = 0;

    constructor(position: [number, number]) {
        this.position = position;
    }
}