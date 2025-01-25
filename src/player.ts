import type {Position} from "./course";

export class Player {
    position: Position;
    #numRounds: number;
    #currRound: number = 0;
    #scoreBoard: number[];

    constructor(position: Position, numRounds: number) {
        this.position = position;
        this.#numRounds = numRounds;
        this.#scoreBoard = Array(numRounds).fill(0);
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
        this.#scoreBoard.fill(0);
    }

    newRound(): void {
        if (this.#currRound >= this.#numRounds - 1) {
            throw new Error("Cannot start new round. Already at last round!");
        }
        this.#currRound++;
    }

    scoreboard(): number[] {
        return this.#scoreBoard;
    }

    round(): number {
        return this.#currRound;
    }

    numRounds(): number {
        return this.#numRounds;
    }
}
