import type {Position} from "./course";
import {Club, clubs, type ClubType, getClub} from "./club";
import {MersenneTwister19937, Random} from "random-js";

class ClubStatus {
    #faces: number[];
    #currentIndex: number = 0;
    readonly rerollRng: Random;

    constructor(club: Club, rerollRng: Random) {
        this.#faces = club.diceFaces();
        this.rerollRng = rerollRng;
    }

    faces(): number[] {
        return this.#faces;
    }

    currentFaceIndex(): number {
        return this.#currentIndex;
    }

    current(): number {
        return this.#faces[this.#currentIndex];
    }

    next(): boolean {
        if (this.#currentIndex >= this.#faces.length - 1) {
            return false;
        }
        this.#currentIndex++;
        return true;
    }

    shuffle(): void {
        this.#faces = this.rerollRng.shuffle(this.#faces);
        this.#currentIndex = 0;
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
