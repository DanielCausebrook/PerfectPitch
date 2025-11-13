import type {Position} from "./course";
import {Club, ClubBehaviour, clubs, type ClubStatus, type ClubType, getClub} from "./club";
import {MersenneTwister19937, Random} from "random-js";

const CLUB_BEHAVIOUR: ClubBehaviour = ClubBehaviour.Random;
const REROLL_LOCKOUT = 3;


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

        const clubStatusFn = (c: Club, r: Random): ClubStatus => {
            switch (CLUB_BEHAVIOUR) {
                case ClubBehaviour.Sequential: return c.createSequential(r, REROLL_LOCKOUT);
                case ClubBehaviour.Random: return c.createRandom(r);
                default: throw new Error("Unknown club behavior.");
            }
        };
        this.#clubs = new Map(clubs.values().map(c => [
            c.type,
            clubStatusFn(c, new Random(MersenneTwister19937.seed(clubRng.uint32())))
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
