<script lang="ts">
    import Dice from "./Dice.svelte";
    import {nativeMath, pick} from "random-js";

    let animate: boolean = false;
    let timerId: number|null = null;
    let mainDice: number|null = 6;

    export let diceFaces: number[]|null = null;
    export let animationDelayMs = 120;
    export const startAnimation: () => void = () => {
        animate = true;
        animationFrame();
    }
    export const stopAnimation: (at?: number) => void = (at) => {
        animate = false;
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        if (at !== undefined) mainDice = at;
    }
    export const roll: () => number|null = () => {
        return doRoll();
    };

    function animationFrame() {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
        mainDice = changeRoll(mainDice);
        if (animate) {
            timerId = setTimeout(() => {
                timerId = null;
                animationFrame();
            }, animationDelayMs * (Math.random() + 0.5));
        }
    }
    function changeRoll(current: number|null) {
        if (current === null) {
            return doRoll();
        }
        if (diceFaces === null) {
            return null;
        } else if (current === null) {
            return doRoll();
        } else {
            let roll = pick(nativeMath, diceFaces);
            if (roll === current) {
                // Try again just once
                roll = pick(nativeMath, diceFaces);
            }
            return roll;
        }
    }
    function doRoll() {
        if (diceFaces === null) {
            return null;
        } else {
            return pick(nativeMath, diceFaces);
        }
    }
</script>
<section>
    <div class="dice">
        <Dice value={mainDice} filled={true} size="64" color="hsl(0, 0%, 80%)" />
    </div>
</section>
<style>
    section {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 0 10px;

        > .dice {
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 3px hsl(0, 0%, 40%);
            border: 2px solid hsl(0, 0%, 40%);
            border-radius: 14px;
        }
    }
</style>