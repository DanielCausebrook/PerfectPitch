<script lang="ts">
    import {CellBlockType, CellType, Course, Direction, getCellData, moveInDirection, rotateDirection} from "./course";
    import CourseView from "./CourseView.svelte";
    import ClubSelector from "./ClubSelector.svelte";
    import DiceRoller from "./DiceRoller.svelte";
    import {ClubType, getClubData, Player} from "./player.js";
    import {onMount} from "svelte";
    import {timeout} from "./utilities";
    import ClubInfo from "./ClubInfo.svelte";
    import {IconArrowBigRight, IconClipboardList} from "@tabler/icons-svelte";
    import {nativeMath, pick} from "random-js";

    export let course: Course;
    export let player: Player;
    export let onCompletion: (score: number) => void = () => {};
    export let scoreboard: number[];

    const holesPerGame:number = 4;

    let hoveredClub: ClubType|null = null;
    let selectedClub: ClubType|null = null;
    let requestClub: (cellType: CellType, onSelect?: (clubType: ClubType) => void) => Promise<ClubType>;
    let cancelClubRequest: () => void;

    let rollDice: () => number|null;
    let startDiceAnimation: () => void;
    let stopDiceAnimation: () => void;

    let selectDirection: (player: Player) => Promise<Direction>;
    let sinkAnimation: (pos: [number, number]) => void;
    let splashAnimation: (pos: [number, number], direction: Direction) => Promise<void>;

    let win: boolean = false;
    let diceFaces: number[]|null = null;
    let numStrokes: number = 0;
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
        numStrokes++;

        let diceRoll = rollDice();
        if (diceRoll === null) {
            throw new Error("Move was null.");
        }

        let distanceBounced = 0;

        let startingPosition = player.position;
        let movementRemaining: number = diceRoll + getCellData(course.cell(startingPosition)).shotModifier;
        while (movementRemaining > 0) {
            movementRemaining--;
            let adjustedDirection = direction;
            if (movementRemaining === 0 && distanceBounced === 0 && diceRoll >= 5) {
                adjustedDirection = rotateDirection(direction, pick(nativeMath, [-1, 0, 0, 1]));
            }
            let newPosition = moveInDirection(player.position, adjustedDirection);
            if (!course.isValidPosition(newPosition)) {
                await timeout(200);
                movementRemaining = 0;
                break;
            }

            let cell = course.cell(newPosition);
            let cellData = getCellData(cell);
            if (cellData.blockType === CellBlockType.Block) {
                await timeout(200);
                movementRemaining = 0;
                break;
            } else if (cellData.blockType === CellBlockType.Stick && !clubData.noStick()) {
                await timeout(200);
                movementRemaining = 0;
            } else {
                if (movementRemaining === 0 && distanceBounced < cellData.rollDistance && clubData.allowsRolls()) {
                    distanceBounced++;
                    movementRemaining++;
                }
            }
            player.position = newPosition;
            await timeout(500 - movementRemaining * 60);
        }
        let cell = course.cell(player.position);
        let cellData = getCellData(cell);
        if (cellData.outOfBounds) {
            showBall = false;
            await splashAnimation(player.position, direction);
            showBall = true;
            player.position = startingPosition;
        } else if (cell === CellType.Hole) {
            win = true;
            sinkAnimation(player.position);
        }
    }

    onMount(async () => {
        while(!win) {
            await takeTurn();
        }
    })

</script>

<article>
    <div class="header">
        <div class="hole-number">Hole {scoreboard.length + 1}</div>
        {#if win}
            <div class="scoreboard">
                <ul>
                    {#each {length: holesPerGame} as _, i}
                        {#if i === scoreboard.length}
                            <li class="latest">{numStrokes}</li>
                        {:else}
                            <li>{(scoreboard.length > i) ? scoreboard[i] : ''}</li>
                        {/if}
                    {/each}
                </ul>
                <div class="total-score">{scoreboard.reduce((sum, score) => sum + score, numStrokes)}</div>
            </div>
        {:else}
            <div class="stroke-counter">{numStrokes} {numStrokes === 1 ? 'Stroke' : 'Strokes'}</div>
        {/if}
    </div>
    <div class="course">
        <CourseView course={course} ballPos={showBall ? player.position : null} bind:selectDirection={selectDirection} bind:sinkAnimation={sinkAnimation} bind:splashAnimation={splashAnimation} />
    </div>
    <div class="status">
        <div class="dice-roll">
            <DiceRoller diceFaces={diceFaces} bind:startAnimation={startDiceAnimation} bind:stopAnimation={stopDiceAnimation} bind:roll={rollDice} />
        </div>
        <div class="info">
            {#if win}
                <div class="win">
                    <span>Congratulations!</span>
                    {#if scoreboard.length + 1 >= holesPerGame}
<!--                        <IconClipboardList size="36" stroke="3"/>-->
                    {:else}
                        <button type="button" onclick={() => onCompletion(numStrokes)}>
                            <IconArrowBigRight stroke="4" />
                        </button>
                    {/if}
                </div>
            {:else if hoveredClub !== null}
                <ClubInfo clubType={hoveredClub} />
            {:else if selectedClub !== null}
                <ClubInfo clubType={selectedClub} />
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
                         color: hsl(180, 80%, 80%);
                     }
                     > button {
                         display: flex;
                         flex-flow: row nowrap;
                         align-items: center;
                         justify-content: center;
                         gap: 10px;
                         position: relative;
                         padding: 8px 16px;
                         background: hsl(240, 60%, 55%);
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
            height: 25px;
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
                    color: hsl(180, 80%, 80%);
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
                        background: hsla(180, 80%, 80%, 15%);
                        width: 40px;
                        line-height: 1cap;
                        &.latest {
                            box-shadow: 0 0 5px 2px hsl(180, 80%, 80%) inset;
                        }
                    }
                }
            }

        }
    }
</style>