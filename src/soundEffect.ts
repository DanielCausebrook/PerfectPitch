import {browser} from '$app/environment';
import putter from '$lib/licensed/sports golfing golf club swing hit ball putter 01.wav';
import putter2 from '$lib/licensed/sports golfing golf club swing hit ball putter 04.wav';
import iron from '$lib/licensed/sports golfing golf club swing hit ball iron from fairway 01.wav';
import driver from '$lib/licensed/sports golfing golf club swing hit ball driver from tee 02.wav';
import wedge from '$lib/licensed/sports golfing golf club swing hit ball wedge from fairway 04.wav';
import sandWedge from '$lib/licensed/sports golfing golf club swing hit ball wedge from hazzard sand trap 03.wav';
import bunker from '$lib/licensed/sports golfing golf ball land in hazzard sand trap 07.wav';
import water from '$lib/licensed/sports golfing golf ball land in water hazzard 03.wav';
import tree from '$lib/licensed/sports golfing golf ball hit tree then ground 03.wav';
import hole from '$lib/licensed/sports golfing golf ball drops falls in hole 01.wav';

export class SoundEffect {
    static putter = new SoundEffect(putter2);
    static iron = new SoundEffect(iron, 70);
    static driver = new SoundEffect(driver, 220);
    static wedge = new SoundEffect(wedge);
    static sandWedge = new SoundEffect(sandWedge);
    static bunker = new SoundEffect(bunker);
    static water = new SoundEffect(water);
    static tree = new SoundEffect(tree);
    static hole = new SoundEffect(hole);

    audio: HTMLAudioElement|null = null;
    startAtMs: number = 0;

    constructor(url: string, startAtMs?: number) {
        this.startAtMs = startAtMs ?? 0;
        if (browser) {
            this.audio = new Audio(url);
        }
    }

    play() {
        if(this.audio !== null) {
            this.audio.currentTime = this.startAtMs / 1000;
            this.audio.play();
        }
    }
}
