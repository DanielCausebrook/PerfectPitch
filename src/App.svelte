<script lang="ts">
    import {IconDice3Filled, IconSeedling} from "@tabler/icons-svelte";
    import {MersenneTwister19937} from "random-js";
    import {Player} from "./player";
    import {Course} from "./course";
    import Round from "./Round.svelte";
    import {goto} from "$app/navigation";
    import {randomSeed, seedFromString} from "./seed";
    import {seedToSeedId} from "./seed.js";
    import {base} from "$app/paths";

    export let seed: number;

    let currentRoundSeed: number|null = null;
    let nextRoundSeed: number|null = null;

    let seedStringInput: string;

    let course: Course|null;
    let player: Player = new Player([0, 0], 4);

    function beginRound(seed: number) {
        let rng = MersenneTwister19937.seed(seed);
        currentRoundSeed = seed;
        nextRoundSeed = rng.next();
        let maybeCourse: Course|null = null;
        while (maybeCourse === null) {
            maybeCourse = Course.generate(20, 20, MersenneTwister19937.seed(rng.next()));
        }
        course = maybeCourse;
        player.position = course.tee();
    }

    function nextRound() {
        player.newRound();
        beginRound(nextRoundSeed ?? MersenneTwister19937.autoSeed().next());
    }

    function randomGame() {
        player.newGame();
        seedStringInput = '';
        seed = randomSeed();
        goto(base + '/play?seed=' + seedToSeedId(seed)).then(() => {
            navigator.clipboard.writeText(window.location.toString());
        });
        beginRound(seed);
    }

    async function seedGame() {
        player.newGame();
        seed = await seedFromString(seedStringInput);
        goto(base + '/play?seed=' + seedToSeedId(seed)).then(() => {
            navigator.clipboard.writeText(window.location.toString())
        });
        beginRound(seed);
    }

    beginRound(seed);
</script>

<div class="wrapper">
    <header>
        <div>
            <span>Puttarium</span>
            <div class="new-round">
                <input type="text" onfocus={e => e.currentTarget.select()} onkeydown={e => {if (e.key === "Enter") { seedGame(); }}} bind:value={seedStringInput} size="12" />
                <button type="button" onclick={seedGame}>
                    <IconSeedling size="16" stroke="3"/>
                </button>
                <button type="button" onclick={randomGame}>
                    <IconDice3Filled size="16" stroke="3" />
                </button>
            </div>
        </div>
    </header>
    <main>
        {#if course !== null}
            {#key course}
                <Round course={course} player={player} onCompletion={nextRound} />
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