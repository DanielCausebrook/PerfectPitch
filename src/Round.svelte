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
    import ClubSelector from "./ClubSelector.svelte";
    import DiceRoller from "./DiceRoller.svelte";
    import {ClubType, getClubData} from "./club.js";
    import {onMount} from "svelte";
    import {timeout} from "./utilities";
    import ClubInfo from "./ClubInfo.svelte";
    import {IconArrowRight} from "@tabler/icons-svelte";
    import {nativeMath, pick} from "random-js";
    import {SoundEffect} from "./soundEffect";
    import type {Player} from "./player";

    export let course: Course;
    export let player: Player;
    export let onCompletion: () => void = () => {};

    const holesPerGame:number = 4;

    let hoveredClub: ClubType|null = null;
    let selectedClub: ClubType|null = null;
    let requestClub: (cellType: CellType, onSelect?: (clubType: ClubType) => void) => Promise<ClubType>;
    let cancelClubRequest: () => void;

    let rollDice: () => number|null;
    let startDiceAnimation: () => void;
    let stopDiceAnimation: () => void;

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
    let diceFaces: number[]|null = null;
    let showBall: boolean = true;

    async function takeTurn() {
        selectedClub = null;
        selectedClub = await requestClub(course.cell(player.position), (clubType: ClubType) => {
            selectedClub = clubType;
            diceFaces = getClubData(clubType).diceFaces();
        });
        startDiceAnimation();

        let direction = await selectDirection(player);
        cancelClubRequest();
        let clubData = getClubData(selectedClub);
        clubData.soundEffect(course.cell(player.position)).play();
        player.addStroke();

        let diceRoll = rollDice();
        if (diceRoll === null) {
            throw new Error("Move was null.");
        }

        let distanceMoved = 0;
        let distanceBounced = 0;

        let startingPosition = player.position;
        let movementRemaining: number = diceRoll;
        if (!clubData.noShotModifier()) {
            movementRemaining += getCellData(course.cell(startingPosition)).shotModifier;
        }

        while (movementRemaining > 0) {
            movementRemaining--;
            if (movementRemaining === 0 && distanceBounced === 0 && diceRoll >= 5) {
                direction = rotateDirection(direction, pick(nativeMath, [-1, 0, 0, 1]));
            }
            let newPosition = moveInDirection(player.position, direction);
            distanceMoved++;
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
            } else if (cellData.blockType === CellBlockType.Stick && !clubData.noStick()) {
                player.position = newPosition;
                await timeout(200);
                if (movementRemaining > 0) {
                    interactAnimation(newPosition, cellData.primaryColor, 1, rotateDirection(direction, 2));
                    cellData.blockSoundEffect?.play();
                }
                movementRemaining = 0;
                break;
            }
            if (movementRemaining === 0 && distanceBounced < cellData.rollDistance && clubData.allowsRolls()) {
                interactAnimation(newPosition, cellData.primaryColor, 0.5, direction);
                distanceBounced++;
                movementRemaining++;
            }
            player.position = newPosition;
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
    <div class="course">
        <CourseView course={course} ballPos={showBall ? player.position : null} bind:selectedClub={selectedClub} bind:selectDirection={selectDirection} bind:playAnimation={playAnimation} bind:winAnimation={winAnimation} />
    </div>
    <div class="status">
        <div class="dice-roll">
            <DiceRoller diceFaces={diceFaces} bind:startAnimation={startDiceAnimation} bind:stopAnimation={stopDiceAnimation} bind:roll={rollDice} />
        </div>
        <div class="info">
            {#if win}
                <div class="win">
                    <span>Congratulations!</span>
                    {#if player.round() >= player.numRounds() - 1}
<!--                        <IconClipboardList size="36" stroke="3"/>-->
                    {:else}
                        <button type="button" onclick={() => onCompletion()}>
                            <IconArrowRight stroke="4" />
                        </button>
                    {/if}
                </div>
            {:else if hoveredClub !== null}
                <ClubInfo clubType={hoveredClub} cellType={course.cell(player.position)} />
            {:else if selectedClub !== null}
                <ClubInfo clubType={selectedClub} cellType={course.cell(player.position)} />
            {/if}
        </div>
    </div>
    <div class="club-selector">
        <ClubSelector bind:request={requestClub} bind:cancel={cancelClubRequest} bind:hoveredClub={hoveredClub} />
    </div>
</article>

<style>
    article {
        display: flex;
        flex-flow: column nowrap;
        grid-gap: 15px;
        margin: 25px;

        > .course {
            grid-area: course;
        }
        > .status {
            display: flex;
            flex-flow: row nowrap;
            > .dice-roll {
                flex: 0 0 auto;
            }
            > .info {
                flex: 1 1 auto;
                 align-self: center;
                 > .win {
                     display: flex;
                     flex-flow: row nowrap;
                     align-items: center;
                     justify-content: space-evenly;
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
        }

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
            > .stroke-counter {
                font-size: 22pt;
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
    }
</style>