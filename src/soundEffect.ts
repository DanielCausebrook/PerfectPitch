import {browser} from '$app/environment';
import putter from '$lib/licensed/sports golfing golf club swing hit ball putter 01.mp3';
import iron from '$lib/licensed/sports golfing golf club swing hit ball iron from fairway 01.mp3';
import driver from '$lib/licensed/sports golfing golf club swing hit ball driver from tee 02.mp3';
import wedge from '$lib/licensed/sports golfing golf club swing hit ball wedge from fairway 04.mp3';
import sandWedge from '$lib/licensed/sports golfing golf club swing hit ball wedge from hazzard sand trap 03.mp3';
import bunker from '$lib/licensed/sports golfing golf ball land in hazzard sand trap 07.mp3';
import water from '$lib/licensed/sports golfing golf ball land in water hazzard 03.mp3';
import tree from '$lib/licensed/sports golfing golf ball hit tree then ground 03.mp3';
import hole from '$lib/licensed/sports golfing golf ball drops falls in hole 01.mp3';

const audioContext = browser ? new AudioContext() : null;

export class SoundEffect {
    static putter = new SoundEffect(putter, 1);
    static iron = new SoundEffect(iron, 0.75);
    static driver = new SoundEffect(driver, 0.4);
    static wedge = new SoundEffect(wedge, 0.35);
    static sandWedge = new SoundEffect(sandWedge, 0.6);
    static bunker = new SoundEffect(bunker, 0.5);
    static water = new SoundEffect(water, 0.7);
    static tree = new SoundEffect(tree, 0.3);
    static hole = new SoundEffect(hole, 0.6);

    audio: HTMLAudioElement|null = null;
    track: MediaElementAudioSourceNode|null = null;
    startAtMs: number = 0;

    constructor(url: string, volume: number, startAtMs?: number) {
        this.startAtMs = startAtMs ?? 0;
        if (browser && audioContext !== null) {
            this.audio = new Audio(url);
            this.audio.load();
            this.audio.volume = volume;
            this.track = audioContext.createMediaElementSource(this.audio);
            this.track.connect(audioContext.destination);
        }
    }

    play() {
        if(this.audio !== null) {
            this.audio.currentTime = this.startAtMs / 1000;
            this.audio.play();
        }
    }
}