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
    static putter = new SoundEffect(putter2, 1);
    static iron = new SoundEffect(iron, 0.7, 70);
    static driver = new SoundEffect(driver, 0.9, 200);
    static wedge = new SoundEffect(wedge, 0.4);
    static sandWedge = new SoundEffect(sandWedge, 0.6);
    static bunker = new SoundEffect(bunker, 0.5);
    static water = new SoundEffect(water, 0.7);
    static tree = new SoundEffect(tree, 0.3);
    static hole = new SoundEffect(hole, 0.6);

    audio: HTMLAudioElement|null = null;
    startAtMs: number = 0;

    constructor(url: string, volume: number, startAtMs?: number) {
        this.startAtMs = startAtMs ?? 0;
        if (browser) {
            this.audio = new Audio(url);
            this.audio.volume = volume;
        }
    }

    play() {
        if(this.audio !== null) {
            this.audio.currentTime = this.startAtMs / 1000;
            this.audio.play();
        }
    }
}
