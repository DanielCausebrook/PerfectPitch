import {Club, ClubBehaviour, clubs, type ClubStatus, type ClubType} from "../club";
import {MersenneTwister19937, Random} from "random-js";
import type {Point2D} from "$lib/maths/point2D";

const CLUB_BEHAVIOUR: ClubBehaviour = ClubBehaviour.Random;
const REROLL_LOCKOUT = 3;

export class Player {
    position: Point2D;
    #clubs: Map<ClubType, ClubStatus>;

    constructor(position: Point2D, clubRng: Random) {
        this.position = position;

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
}
