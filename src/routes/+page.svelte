<script lang="ts">
    import {IconDice3Filled, IconSeedling} from "@tabler/icons-svelte";
    import {MersenneTwister19937} from "random-js";
    import {Course} from "../course";
    import {Player} from "../player";
    import Hole from "../Hole.svelte";

    let now = new Date();

    let currentSeed: number|null = null;
    let seedInput: number = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
    let nextSeed: number|null = null;

    let course: Course|null;
    let player: Player|null;
    let scoreboard: number[] = [];

    function randomiseSeed() {
        seedInput = MersenneTwister19937.autoSeed().next();
    }

    function generateRound(seed: number) {
        let rng = MersenneTwister19937.seed(seed);
        currentSeed = seed;
        nextSeed = rng.next();
        let maybeCourse: Course|null = null;
        let maybePlayer: Player|null = null;
        while (maybeCourse === null || maybePlayer === null) {
            maybeCourse = Course.generate(20, 20, MersenneTwister19937.seed(rng.next()));
            maybePlayer = maybeCourse?.createPlayer(MersenneTwister19937.seed(rng.next())) ?? null;
        }
        course = maybeCourse;
        player = maybePlayer;
    }

    generateRound(seedInput);

    function newRound() {
        scoreboard = [];
        generateRound(seedInput);
    }

    function nextRound(score: number) {
        scoreboard.push(score);
        generateRound(nextSeed ?? MersenneTwister19937.autoSeed().next());
    }

</script>
<div class="wrapper">
    <header>
        <div>
            <span>Puttarium</span>
            <div class="new-round">
                <input type="text" onfocus={e => e.currentTarget.select()} onkeydown={e => {if (e.key === "Escape" && currentSeed !== null) {seedInput = currentSeed; e.currentTarget.blur();}}} bind:value={seedInput} size="12" />
                <button type="button" onclick={() => newRound()}>
                    <IconSeedling size="16" stroke="3"/>
                </button>
                <button type="button" onclick={() => {randomiseSeed(); newRound();}}>
                    <IconDice3Filled size="16" stroke="3" />
                </button>
            </div>
        </div>
    </header>
    <main>
        {#if course !== null && player !== null}
            {#key course}
                <Hole course={course} player={player} scoreboard={scoreboard} onCompletion={nextRound} />
            {/key}
        {/if}
    </main>
</div>
<style>
    .wrapper {
        flex: 1 1 auto;
        display: grid;
        grid-template:
      "header header header" auto
      ". main ." 1fr
      / 1fr auto 1fr;

        > header {
            grid-area: header;
            display: grid;
            grid-template-columns: subgrid;
            background: hsl(0, 0%, 0%);

            > div {
                grid-column: 2 / span 1;
                justify-self: stretch;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                max-width: 1280px;
                padding: 5px 0;

                > span {
                    display: block;
                    flex: 1 1 auto;
                    font-size: 24pt;
                }
                > .new-round {
                    flex: 0 1 auto;
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    gap: 3px;
                    > button {
                        display: flex;
                        place-items: center;
                        padding: 5px 10px;
                        background: hsl(0, 0%, 12%);
                        color: hsl(0, 0%, 80%);
                        border-radius: 2px;
                    }
                    > input {
                        background: hsl(0, 0%, 20%);
                        border: none;
                        padding: 5px 10px;
                        border-radius: 2px;
                        color: hsl(0, 0%, 80%);
                        font-family: inherit;
                        font-weight: inherit;
                    }
                }
            }

        }
        > main {
            grid-area: main;
            align-self: start;
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            margin: 25px;
            max-width: 1280px;
        }
    }
</style>