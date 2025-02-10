<script lang="ts">
    import {
        CellAnimation,
        CellBlockType,
        CellType,
        Course,
        Direction,
        getCellData,
        moveInDirection,
        type Position,
        rotateDirection
    } from "./course";
    import CourseView from "./CourseView.svelte";
    import {type ClubData, ClubType, getClubData} from "./club.js";
    import {onMount} from "svelte";
    import {timeout} from "./utilities";
    import {IconArrowRight} from "@tabler/icons-svelte";
    import {bool, nativeMath, pick} from "random-js";
    import {SoundEffect} from "./soundEffect";
    import type {Player} from "./player";
    import ClubSelector from "./ClubSelector.svelte";

    export let course: Course;
    export let player: Player;
    export let onCompletion: () => void = () => {};

    const holesPerGame:number = 4;

    let enableClubSelect = false;
    let selectedClub: ClubData|null;
    let onSelectClub: ((clubData: ClubData) => void)|null = null;

    let selectDirection: (player: Player) => Promise<Direction>;
    let playAnimation: (pos: Position, animation: CellAnimation) => void;
    let winAnimation: (pos: Position) => void;

    function interactAnimation(pos: Position, color: string, intensity: number, direction: Direction): Promise<void> {
        playAnimation(pos, CellAnimation.combine(
            CellAnimation.wobble(direction, 75*intensity, 1000),
            CellAnimation.glow(color, 15*intensity, 1000)
        ));
        return timeout(1000);
    }
    function sinkAnimation(pos: Position, color: string, direction: Direction): Promise<void> {
        showBall = false;
        playAnimation(pos, CellAnimation.combine(
            CellAnimation.spin(direction, 1000),
            CellAnimation.glow(color, 20, 1000)
        ));
        return timeout(1000).then(() => { showBall = true; });
    }

    let win: boolean = false;
    let showBall: boolean = true;

    async function takeTurn() {
        selectedClub = null;
        selectedClub = await new Promise<ClubData>((resolve, reject) => {
            enableClubSelect = true;
            onSelectClub = (clubData) => {
                selectedClub = clubData;
                SoundEffect.select.play();
                resolve(clubData);
            };
        });

        let direction = await selectDirection(player);
        enableClubSelect = false;
        let clubData = selectedClub;
        clubData.soundEffect(course.cell(player.position)).play();
        player.addStroke();

        let diceRoll = pick(nativeMath, clubData.diceFaces());
        if (diceRoll === null) {
            throw new Error("Move was null.");
        }

        let distanceMoved = 0;
        let distanceBounced = 0;
        let slicedYet = false;

        function updatePosition(pos: Position) {
            player.position = pos;
        }

        let startingPosition = player.position;
        let movementRemaining: number = diceRoll;
        if (!clubData.noShotModifier()) {
            movementRemaining += getCellData(course.cell(startingPosition)).shotModifier;
        }

        while (movementRemaining > 0) {
            movementRemaining--;
            distanceMoved++;
            if (!slicedYet && distanceMoved >= 5 && distanceBounced === 0 && bool(1/3)(nativeMath)) {
                direction = rotateDirection(direction, pick(nativeMath, [-1, 0, 0, 1]));
                slicedYet = true;
            }
            let newPosition = moveInDirection(player.position, direction);
            if (!course.isValidPosition(newPosition)) {
                if (distanceMoved === 1) await timeout(200);
                distanceMoved--;
                movementRemaining = 0;
                break;
            }

            let cell = course.cell(newPosition);
            let cellData = getCellData(cell);
            if (cellData.blockType === CellBlockType.Block) {
                if (distanceMoved === 1) await timeout(200);
                distanceMoved--;
                interactAnimation(newPosition, cellData.primaryColor, 1, rotateDirection(direction, 2));
                cellData.blockSoundEffect?.play();
                movementRemaining = 0;
                break;
            } else if (cellData.blockType === CellBlockType.Stick && clubData.sticks()) {
                updatePosition(newPosition);
                await timeout(200);
                if (movementRemaining > 0) {
                    interactAnimation(newPosition, cellData.primaryColor, 1, rotateDirection(direction, 2));
                    cellData.blockSoundEffect?.play();
                }
                movementRemaining = 0;
                break;
            }
            updatePosition(newPosition);
            if (movementRemaining === 0 && distanceBounced < cellData.rollDistance && clubData.bounces()) {
                interactAnimation(newPosition, cellData.primaryColor, 0.5, direction);
                distanceBounced++;
                movementRemaining++;
            }
            if (movementRemaining === 0) {
                await timeout(100);
            } else {
                await timeout(500 - movementRemaining * 60);
            }
        }
        let cell = course.cell(player.position);
        let cellData = getCellData(cell);
        if (distanceMoved > 0) {
            cellData.landSoundEffect?.play();
        }
        if (cellData.outOfBounds) {
            await sinkAnimation(player.position, cellData.primaryColor, direction);
            player.position = startingPosition;
        } else if (cell === CellType.Hole) {
            await timeout(400);
            win = true;
            SoundEffect.hole.play();
            winAnimation(player.position);
        }
    }

    onMount(async () => {
        while(!win) {
            await takeTurn();
            await timeout(500);
        }
    })

</script>

<article>
    <div class="header">
        <div class="hole-number">Hole {player.round() + 1}</div>
        <div class="scoreboard">
            <ul>
                {#each {length: holesPerGame} as _, roundNum}
                    {#if roundNum === player.round()}
                        <li class="latest">{player.strokes()}</li>
                    {:else}
                        <li>{(roundNum < player.round()) ? player.strokes(roundNum) : ''}</li>
                    {/if}
                {/each}
            </ul>
            <div class="total-score">{player.totalStrokes()}</div>
        </div>
    </div>
    <CourseView course={course} ballPos={showBall ? player.position : null} bind:selectDirection={selectDirection} bind:playAnimation={playAnimation} bind:winAnimation={winAnimation} />
    {#if win}
        <div class="win">
            <span>Congratulations!</span>
            {#if player.round() >= player.numRounds() - 1}
                <!--                        <IconClipboardList size="36" stroke="3"/>-->
            {:else}
                <button type="button" class="standard-button" onclick={() => onCompletion()}>
                    <IconArrowRight stroke="4" />
                </button>
            {/if}
        </div>
    {:else}
        <ClubSelector
                clubs={ [ClubType.Putter, ClubType.Wedge, ClubType.Iron, ClubType.Driver].map(c => {let data = getClubData(c); return {data: data, enabled: data.canUseOn(course.cell(player.position))}}) }
                enabled={enableClubSelect}
                bind:selectedClub={selectedClub}
                bind:onSelect={onSelectClub}
        />
    {/if}
</article>

<style>
    article {
        display: flex;
        flex-flow: column nowrap;
        margin: 15px 25px;
        gap: 10px;

        > .header {
            display: flex;
            flex-flow: row nowrap;
            align-items: flex-end;
            justify-content: space-between;
            gap: 10px;
            height: 35px;
            line-height: 1cap;

            > .hole-number {
                font-size: 18pt;
                color: hsl(0, 0%, 60%);
                width: 100px;
                padding: 5px 10px;
            }
            > .scoreboard {
                display: flex;
                flex-flow: row nowrap;
                align-items: stretch;
                justify-content: center;
                gap: 10px;
                > .total-score {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 5px 10px;
                    font-size: 24pt;
                    color: hsl(210, 80%, 80%);
                }
                > ul {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: 5px;
                    align-items: stretch;
                    justify-content: center;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    > li {
                        flex: 0 1 auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 5px;
                        font-size: 20pt;
                        border-radius: 8px;
                        background: hsla(210, 80%, 80%, 15%);
                        width: 40px;
                        line-height: 1cap;
                        &.latest {
                            box-shadow: 0 0 5px 2px hsl(210, 80%, 80%) inset;
                        }
                    }
                }
            }
        }

        > .win {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: space-evenly;
            height: 170px;

            > span {
                font-size: 24pt;
                color: hsl(210, 80%, 80%);
            }

            > button {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: center;
                gap: 10px;
                position: relative;
                padding: 8px 16px;
                background: hsl(210, 70%, 50%);
                border-radius: 5px;
            }
        }
    }
</style>