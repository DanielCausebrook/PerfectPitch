import type {Region2D} from "$lib/maths/tiling2D";
import {Hole} from "$lib/hole";
import {Player} from "$lib/player";
import {MersenneTwister19937, Random} from "random-js";

export class Course<R extends Region2D> {
    readonly holes: Hole<R>[];
    readonly players: Player[] = [];
    #scoreboard: Map<Player, number[]> = new Map();
    #currentHoleNum = 0;

    constructor(holes: Hole<R>[], numPlayers: number, rng: Random) {
        this.holes = holes;
        for (let i = 0; i < numPlayers; i++) {
            const player = new Player(this.holes[0].teePos, new Random(MersenneTwister19937.seed(rng.uint32())));
            this.players.push(player);
            this.#scoreboard.set(player, Array(holes.length).fill(0));
        }
    }

    currentHoleNum(): number {
        return this.#currentHoleNum;
    }

    currentHole(): Hole<R> {
        return this.holes[this.#currentHoleNum];
    }

    addStroke(player: Player): void {
        const scoreboard = this.#scoreboard.get(player);
        if (scoreboard === undefined) {
            throw new Error("Unrecognised player");
        }
        scoreboard[this.#currentHoleNum]++;
    }

    scoreboard(player: Player): number[] {
        const scoreboard = this.#scoreboard.get(player);
        if (scoreboard === undefined) {
            throw new Error("Unrecognised player");
        }
        return scoreboard.slice();
    }

    totalStrokes(player: Player): number {
        const scoreboard = this.#scoreboard.get(player);
        if (scoreboard === undefined) {
            throw new Error("Unrecognised player");
        }
        return scoreboard.reduce((sum, next) => sum + next, 0);
    }

    newRound(): void {
        if (this.#currentHoleNum >= this.holes.length - 1) {
            throw new Error("Cannot start new round. Already at last round!");
        }
        this.#currentHoleNum++;
    }
}
