<script lang="ts">
    import {Course} from "./course";
    import {MersenneTwister19937, Random} from "random-js";
    import {Player} from "./player";
    import Round from "./Round.svelte";
    import {randomSeed, seedFromString, seedToSeedId} from "./seed";
    import {goto} from "$app/navigation";
    import {base} from "$app/paths";
    import {mount, onMount, unmount} from "svelte";
    import {IconCalendarFilled, IconDice3, IconDice3Filled} from "@tabler/icons-svelte";

    export let seed: number|null;
    let currentRound: Record<string, any>|null = null;

    let seedStringInput: string = '';

    async function runGame(seed: number) {
        let rng = MersenneTwister19937.seed(seed);
        let player = new Player([0, 0], 4);
        for (let roundNum = 0; roundNum < player.numRounds(); roundNum++) {
            if (roundNum !== 0) player.newRound();

            const course = Course.generate(22, 22, 3, 2.5, new Random(MersenneTwister19937.seed(rng.next())));
            player.position = course.tee();

            if (currentRound !== null ) {
                await unmount(currentRound, {outro: true});
            }
            currentRound = mount(Round, {
                target: document.querySelector('#round-container') as HTMLElement,
                props: {
                    course: course,
                    player: player,
                }
            });

            await currentRound.run();
        }
    }

    function dailyGame() {
        let now = new Date();
        seed = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
        goto(base + '/play');
        runGame(seed);
    }

    function randomGame() {
        seedStringInput = '';
        seed = randomSeed();
        goto(base + '/play?seed=' + seedToSeedId(seed)).then(() => {
            navigator.clipboard.writeText(window.location.toString());
        });
        runGame(seed);
    }

    async function seedGame() {
        seed = await seedFromString(seedStringInput);
        goto(base + '/play?seed=' + seedToSeedId(seed)).then(() => {
            navigator.clipboard.writeText(window.location.toString())
        });
        runGame(seed);
    }

    onMount(() => {
        if (seed !== null) {
            runGame(seed);
        }
    });
</script>
<div class="app">
    <header>
        <h1>Perfect Pitch</h1>
        <div class="buttons">
            <button type="button" class="standard-button" onclick={randomGame}>
                <IconDice3 size="24" stroke="2" />
            </button>
            <button type="button" class="standard-button" onclick={dailyGame}>
                <IconCalendarFilled size="24" stroke="2" />
            </button>
        </div>
    </header>
    <div id="round-container"></div>
</div>
<style>
    .app {
        flex: 1 1 auto;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: stretch;
        overflow: hidden;
        gap: 40px;
    }
    header {
        flex: 0 0 auto;
        display: flex;
        flex-flow: row-reverse nowrap;
        justify-content: flex-start;
        align-items: baseline;
        padding: 80px 20px;
        gap: 40px;
        background: hsl(100, 50%, 18%);
        border: 4px solid hsl(100, 50%, 32%);
        border-top: 0;
        border-bottom: 0;
        color: hsl(0, 0%, 80%);
        writing-mode: sideways-lr;
        h1 {
            margin: 0;
            font-size: 38px;
        }
        > .buttons {
             flex: 0 1 auto;
             display: flex;
             flex-flow: row nowrap;
             align-items: center;
             gap: 5px;

             button {
                 display: flex;
                 place-items: center;
                 padding: 8px 8px;
                 background: hsl(100, 50%, 10%);
                 color: hsl(0, 0%, 80%);
                 border-radius: 4px;

                 &[disabled] {
                     color: hsl(0, 0%, 45%);
                     cursor: default;
                 }
             }

             /*> .seed-input {*/
             /*    display: flex;*/
             /*    flex-flow: row nowrap;*/
             /*    border-radius: 2px;*/
             /*    outline: 1px solid transparent;*/
             /*    transition: outline-color 0.25s;*/

             /*    &:focus-within {*/
             /*        outline-color: hsl(0, 0%, 50%);*/
             /*    }*/

             /*    > button {*/
             /*        border-radius: 0 2px 2px 0;*/

             /*    }*/

             /*    > input {*/
             /*        background: hsl(0, 0%, 20%);*/
             /*        border: none;*/
             /*        padding: 5px 10px;*/
             /*        border-radius: 2px 0 0 2px;*/
             /*        color: hsl(0, 0%, 80%);*/
             /*        font-family: inherit;*/
             /*        font-weight: inherit;*/

             /*        &:focus {*/
             /*            outline: none;*/
             /*        }*/
             /*    }*/
             /*}*/
         }
    }
    #round-container {
        flex: 0 1 auto;
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        max-width: 100%;
        overflow-y: auto;
        overflow-x: hidden;

        &:empty::before {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            padding: 50px 20px;
            width: 500px;
            font-size: 50px;
            color: hsl(0, 0%, 60%);

            content: 'Loading...';
        }
    }
    @media (max-width: 680px) {
        .app {
            flex-flow: column nowrap;
            justify-content: flex-start;
            align-items: stretch;
            gap: 0;
        }
        header {
            display: flex;
            flex-flow: row nowrap;
            writing-mode: horizontal-tb;
            padding: 20px 50px;
            border: 4px solid hsl(100, 50%, 32%);
            border-left: 0;
            border-right: 0;

            h1 {
                flex: 1 1 auto;
                font-size: 32px;
            }
        }
        #round-container {
            padding: 10px 0;
        }
    }
</style>