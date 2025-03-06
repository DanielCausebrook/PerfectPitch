import type {Position} from "./course";
import {Club, clubs, type ClubType, getClub} from "./club";
import {MersenneTwister19937, Random} from "random-js";

const REROLL_LOCKOUT = 3;

class ClubStatus {
    #faces: number[];
    #currentIndex: number|null = 0;
    #rerollLockout: number|null = null;
    readonly rerollRng: Random;
    readonly sliceRng: Random;

    constructor(club: Club, rng: Random) {
        this.#faces = club.diceFaces();
        this.rerollRng = new Random(MersenneTwister19937.seed(rng.uint32()));
        this.sliceRng = new Random(MersenneTwister19937.seed(rng.uint32()));
        this.shuffle();
    }

    faces(): number[] {
        return this.#faces;
    }

    currentFaceIndex(): number|null {
        return this.#currentIndex;
    }

    strokeCurrent(): {distance: number, sliceValues: (-1|0|1)[]}|null {
        if (this.#currentIndex === null) {
            return null;
        }
        let distance = this.#faces[this.#currentIndex];
        this.#currentIndex++;
        if (this.#currentIndex >= this.#faces.length) {
            this.#currentIndex = null;
            this.#rerollLockout = REROLL_LOCKOUT;
        }
        let slice: (-1|0|1)[] = [];
        for (let i = 0; i < distance; i++) {
            slice.push(this.sliceRng.pick([-1, 0, 1]));
        }
        return {distance: distance, sliceValues: slice};
    }

    advanceLockout() {
        if (this.#rerollLockout !== null && this.#rerollLockout > 0) {
            this.#rerollLockout--;
        }
    }

    current(): number|null {
        return this.#currentIndex !== null ? this.#faces[this.#currentIndex] : null;
    }

    lockoutLeft(): number|null {
        return this.#rerollLockout;
    }

    shuffle(): void {
        this.#faces = this.rerollRng.shuffle(this.#faces);
        this.#currentIndex = 0;
        this.#rerollLockout = null;
    }
}

export class Player {
    position: Position;
    #clubs: Map<ClubType, ClubStatus>;
    #numRounds: number;
    #currRound: number = 0;
    #scoreBoard: number[];

    constructor(position: Position, numRounds: number, clubRng: Random) {
        this.position = position;
        this.#numRounds = numRounds;
        this.#scoreBoard = Array(numRounds).fill(0);
        this.#clubs = new Map(clubs.values().map(c => [
            c.type,
            new ClubStatus(c, new Random(MersenneTwister19937.seed(clubRng.uint32())))
        ]));
    }

    clubStatus(clubType: ClubType): ClubStatus {
        return this.#clubs.get(clubType) as ClubStatus;
    }

    addStroke(): void {
        this.#scoreBoard[this.#currRound]++;
    }

    strokes(roundNum?: number): number {
        return this.#scoreBoard[roundNum ?? this.#currRound];
    }

    totalStrokes(): number {
        return this.#scoreBoard.reduce((total, round) => total + round, 0);
    }

    newGame(): void {
        this.#currRound = 0;
        this.#scoreBoard.fill(0);
    }

    newRound(): void {
        if (this.#currRound >= this.#numRounds - 1) {
            throw new Error("Cannot start new round. Already at last round!");
        }
        this.#currRound++;
    }

    round(): number {
        return this.#currRound;
    }

    numRounds(): number {
        return this.#numRounds;
    }
}
