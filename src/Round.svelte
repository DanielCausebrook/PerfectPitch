<script lang="ts">
    import ClubSelector from "./ClubSelector.svelte";
    import {type Club, ClubType, getClub} from "./club";
    import {CellBlockType, CellType, Course, Direction, getCellData, moveInDirection, type Position} from "./course";
    import {bool, nativeMath, pick} from "random-js";
    import Cell from "./Cell.svelte";
    import {Player} from "./player";
    import {SoundEffect} from "./soundEffect";
    import {timeout} from "./utilities";
    import {rotateDirection} from "./cellAnimation";
    import {createInteractAnimation, createSinkAnimation, playWinAnimation} from "./cellAnimation.js";
    import {Matrix2D} from "./terrainGeneration";
    import {IconArrowRight, IconChevronCompactUp} from "@tabler/icons-svelte";


    export let course: Course = new Course(Matrix2D.of(22, 22, CellType.Water), [10, 10], [11, 11]);
    export let player: Player = new Player([10, 10], 4);

    let cells: Matrix2D<HTMLElement> = Matrix2D.of(course.width(), course.height(), null) as unknown as Matrix2D<HTMLElement>;
    function registerCell(element: HTMLElement, data: Position) {
        cells.data[data[0]][data[1]] = element;
    }

    type DirectionRequest = {
        resolve: (direction: Direction) => void,
        dragCenter: Position|null,
        dragCenterRelativeToGrid: Position|null,
        currentDragDirection: Direction|null,
        touchId: number|null,
    }
    let board: HTMLElement;
    let directionRequest: DirectionRequest|null = null;
    let directionHighlightCells: Map<string, number> = new Map();
    let numDirectionHighlights: number = 0;
    const deadZone = 35;

    async function selectDirection(): Promise<Direction> {
        return new Promise((resolve, reject) => {
            directionRequest = {
                resolve: resolve,
                dragCenter: null,
                dragCenterRelativeToGrid: null,
                currentDragDirection: null,
                touchId: null,
            };
        });
    }

    function dragStart(coordinates: Position) {
        if (directionRequest !== null) {
            directionRequest.dragCenter = coordinates.slice() as Position;
            directionRequest.dragCenterRelativeToGrid = [coordinates[0] - board.offsetLeft - board.clientLeft, coordinates[1] - board.offsetTop - board.clientTop];
            directionRequest.currentDragDirection = null;
        }
    }

    function dragMove(coordinates: Position) {
        if (directionRequest !== null && directionRequest.dragCenter !== null) {
            let vector = [
                coordinates[0] - directionRequest.dragCenter[0],
                coordinates[1] - directionRequest.dragCenter[1],
            ];

            let distance = Math.hypot(vector[0], vector[1]);
            if (directionRequest.currentDragDirection === null && distance < deadZone + 5) {
                return;
            } else if (distance < deadZone) {
                directionRequest.currentDragDirection = null;
                return;
            }

            let angle = Math.atan2(vector[1], vector[0]);
            let adjustedAngle = (10 - (4 * angle / Math.PI)) % 8;
            if (directionRequest.currentDragDirection === null) {
                directionRequest.currentDragDirection = Math.round(adjustedAngle) % 8;
                updateCellDirectionHighlight();
            } else {
                // Use a dead zone
                let angleDirectionDiff = Math.abs(adjustedAngle - Math.round(adjustedAngle));
                if (angleDirectionDiff < 0.45) {
                    directionRequest.currentDragDirection = Math.round(adjustedAngle) % 8;
                    updateCellDirectionHighlight();
                }
            }
        }
    }

    function dragEnd(cancel = false) {
        if (directionRequest !== null && directionRequest.dragCenter !== null) {
            if (directionRequest.currentDragDirection === null || cancel) {
                directionRequest.dragCenter = null;
                directionRequest.dragCenterRelativeToGrid = null;
                directionRequest.currentDragDirection = null;
                directionRequest.touchId = null;
            } else {
                directionRequest.resolve(directionRequest.currentDragDirection);
                directionRequest = null;
            }
        }
    }

    function updateCellDirectionHighlight() {
        directionHighlightCells.clear();
        if (directionRequest === null || directionRequest.currentDragDirection === null) {
            return
        }
        const maxI = numDirectionHighlights + 1
        let highlightPos = player.position;
        for (let i = 0; i < maxI; i++) {
            directionHighlightCells.set(`[${highlightPos[0]}, ${highlightPos[1]}]`, 1 - Math.pow(i/maxI, 3));
            highlightPos = moveInDirection(highlightPos, directionRequest.currentDragDirection);
        }
    }

    function cellDirectionHighlight(position: Position): number {
        if (directionRequest === null || directionRequest.currentDragDirection === null) {
            return 0;
        }
        return directionHighlightCells.get(`[${position[0]}, ${position[1]}]`) ?? 0;
    }

    function registerGameBoard(element: HTMLElement) {
        board = element;
        element.addEventListener("mousedown", event => {
            if (event.button === 0 && directionRequest !== null && directionRequest.touchId === null) {
                directionRequest.dragCenter = [event.x, event.y];
                directionRequest.dragCenterRelativeToGrid = [event.x - board.offsetLeft - board.clientLeft, event.y - board.offsetTop - board.clientTop];
                directionRequest.currentDragDirection = null;
            }
        });
        document.addEventListener("mouseup", event => dragEnd());
        document.addEventListener("mousemove", event => {
            if (directionRequest !== null && directionRequest.touchId === null) {
                if ((event.buttons & 1) !== 1) {
                    dragEnd();
                }
                dragMove([event.x, event.y]);
            }
        });
        element.addEventListener("touchstart", event => {
            if (directionRequest !== null && directionRequest.dragCenter === null) {
                event.preventDefault();
                let touch = event.changedTouches[0];
                directionRequest.dragCenter = [touch.clientX, touch.clientY];
                directionRequest.dragCenterRelativeToGrid = [touch.clientX - board.offsetLeft - board.clientLeft, touch.clientY - board.offsetTop - board.clientTop];
                directionRequest.currentDragDirection = null;
                directionRequest.touchId = touch.identifier;
            }
        });
        document.addEventListener("touchend", event => {
            if (directionRequest !== null && directionRequest.dragCenter !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        dragEnd();
                    }
                }
            }
        });
        document.addEventListener("touchcancel", event => {
            if (directionRequest !== null && directionRequest.dragCenter !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        dragEnd(true);
                    }
                }
            }
        });
        document.addEventListener("touchmove", event => {
            if (directionRequest !== null && directionRequest.dragCenter !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        dragMove([changedTouch.clientX, changedTouch.clientY]);
                    }
                }
            }
        });
    }

    type ClubRequest = { resolve: (clubData: Club) => void };
    let clubRequest: ClubRequest|null = null;

    let enableClubSelect = false;
    let selectedClub: Club|null = null;
    let onSelectClub: ((clubData: Club) => void)|null = (clubData) => {
        numDirectionHighlights = Math.round(clubData.diceFaces().reduce((a, b) => Math.max(a,b)));
        clubRequest?.resolve(clubData);
    };

    let win: boolean = false;
    let showBall: boolean = true;

    async function takeTurn() {
        if (selectedClub !== null && !selectedClub.canUseOn(course.cell(player.position))) {
            selectedClub = null;
        }
        enableClubSelect = true;
        if (selectedClub === null) {
            selectedClub = await new Promise<Club>((resolve, reject) => {
                clubRequest = {resolve: resolve};
            });
        }

        let direction = await selectDirection();
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
                createInteractAnimation(cellData.primaryColor, 1, rotateDirection(direction, 2))
                    .play(cells.get(...newPosition));
                cellData.blockSoundEffect?.play();
                movementRemaining = 0;
                break;
            } else if (cellData.blockType === CellBlockType.Stick && clubData.sticks()) {
                updatePosition(newPosition);
                await timeout(200);
                if (movementRemaining > 0) {
                    createInteractAnimation(cellData.primaryColor, 1, rotateDirection(direction, 2))
                        .play(cells.get(...newPosition));
                    cellData.blockSoundEffect?.play();
                }
                movementRemaining = 0;
                break;
            }
            updatePosition(newPosition);
            if (movementRemaining === 0 && distanceBounced < cellData.rollDistance && clubData.bounces()) {
                createInteractAnimation(cellData.primaryColor, 0.5, direction)
                    .play(cells.get(...newPosition));
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
            showBall = false;
            await createSinkAnimation(cellData.primaryColor, direction)
                .play(cells.get(...player.position));
            showBall = true;
            player.position = startingPosition;
        } else if (cell === CellType.Hole) {
            await timeout(400);
            win = true;
            SoundEffect.hole.play();
            playWinAnimation(player.position, cells);
        }

        // Prevent UI from flashing
        if (distanceMoved <= 1) {
            await timeout(300);
        }
    }

    let nextRound = () => {};

    export async function run(): Promise<void> {
        while (!win) {
            await takeTurn();
        }
        selectedClub = null;
        return new Promise<void>(resolve => {
            nextRound = resolve;
        })
    }
</script>
<div class="game">
    <div class="board">
        <div class="status">
            <div class="hole">Hole 1</div>
            <div class="scoreboard">
                <ul>
                    {#each {length: player.numRounds()} as _, roundNum}
                        {#if roundNum === player.round()}
                            <li class="score latest">{player.strokes()}</li>
                        {:else}
                            <li class="score">{(roundNum < player.round()) ? player.strokes(roundNum) : ''}</li>
                        {/if}
                    {/each}
                </ul>
                <div class="score total">{player.totalStrokes()}</div>
            </div>
        </div>
        <div class="grid" use:registerGameBoard style="grid: repeat({course.height()}, 1fr) / repeat({course.width()}, 1fr);">
            {#each {length: course.height()} as _, y}
                {#each {length: course.width()} as _, x}
                    {@const highlight = cellDirectionHighlight([x, y])}
                    <div class="cell" class:direction-highlight={highlight !== 0} style="{highlight !== 0 ? `outline-color: hsl(0, 0%, ${highlight*100}%); `: ''}" use:registerCell={[x, y]}>
                        {#key course}
                            <Cell size={20} cellType={course === null ? CellType.Water : course.cell([x, y])} hasBall={course !== null && showBall && player.position[0] === x && player.position[1] === y} />
                        {/key}
                        <div class="glow-element"></div>
                    </div>
                {/each}
            {/each}
            {#if directionRequest !== null && directionRequest.dragCenterRelativeToGrid !== null}
                <div class="drag-center" style="left: {directionRequest.dragCenterRelativeToGrid[0]}px; top: {directionRequest.dragCenterRelativeToGrid[1]}px;">
                    {#if directionRequest.currentDragDirection !== null}
                        <div class="drag-arrow-rotation" style="transform: rotate({180-directionRequest.currentDragDirection*45}deg);">
                            <div class="drag-arrow"><IconChevronCompactUp size="30"/></div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    <div class="bottom-panel">
        {#if win}
            <div class="win">
                <span>Congratulations!</span>
                {#if player.round() >= player.numRounds() - 1}
                    <!--                        <IconClipboardList size="36" stroke="3"/>-->
                {:else}
                    <button type="button" class="standard-button" onclick={nextRound}>
                        <IconArrowRight stroke="4" />
                    </button>
                {/if}
            </div>
        {/if}
        <ClubSelector
                clubs={ [ClubType.Putter, ClubType.Wedge, ClubType.Iron, ClubType.Driver].map(c => {let data = getClub(c); return {data: data, enabled: course !== null && data.canUseOn(course.cell(player.position))}}) }
                enabled={enableClubSelect}
                bind:selectedClub={selectedClub}
                bind:onSelect={onSelectClub}
        />
    </div>
</div>
<style>
    .game {
        flex: 1 1 auto;
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-start;
        align-items: stretch;
        gap: 20px;
        padding: 20px;
        max-height: 900px;
    }
    .status {
        align-self: stretch;
        display: flex;
        flex-flow: row nowrap;
        align-items: baseline;
        justify-content: space-between;
        padding: 0 10px 10px;
        font-size: 26px;
        line-height: 1;
        z-index: 1;
        color: hsl(0, 0%, 80%);

        .hole {
            color: hsl(0, 0%, 60%);
        }
    }
    .grid {
        flex: 0 0 auto;
        display: grid;
        gap: 3px;
        position: relative;

        > .cell {
            position: relative;
            border-radius: 15%;
            outline: 1px solid transparent;
            transition: outline-color 0.15s;

            &.direction-highlight {
                transition: outline-color 0.05s;
            }

            > .glow-element {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                border-radius: 3px;
                z-index: 1;
            }
        }
        > .drag-center {
            --radius: 25px;
            position: absolute;
            width: calc(2 * var(--radius));
            height: calc(2 * var(--radius));
            border-radius: 50%;
            transform: translate(-50%, -50%);
            background: hsl(0, 0%, 100%, 25%);
            border: 1px solid hsl(0, 100%, 100%, 60%);

            &::before {
                position: absolute;
                top: 50%;
                left: 50%;
                height: 7px;
                width: 7px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                background: hsl(0, 100%, 50%);
                content: '';
            }

            > .drag-arrow-rotation {
                position: absolute;
                top: 50%;
                left: 50%;
                > .drag-arrow {
                    position: absolute;
                    top: calc(-1 * var(--radius) - 5px);
                    transform: translate(-50%, -50%);
                    color: hsl(0, 0%, 100%);
                }
            }
        }
    }

    .scoreboard {
        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
        justify-content: center;
        gap: 10px;

        .score {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 18pt;
            width: 40px;
            padding: 4px 3px;

            &.latest {
                background: hsl(0, 0%, 23%);
            }
        }

        .total {
            font-size: 20pt;
            border: 1px solid hsl(0, 0%, 40%);
        }

        > ul {
            display: flex;
            flex-flow: row nowrap;
            gap: 8px;
            align-items: stretch;
            justify-content: center;
            list-style: none;
            margin: 0;
            padding: 0;

            > li {
                flex: 0 1 auto;
                position: relative;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    height: 5px;
                    left: 0;
                    right: 0;
                    border: 2px solid hsl(0, 0%, 50%);
                    border-top: none
                }
                &.latest {
                    background: hsl(0, 0%, 15%);
                }
            }
        }
    }

    .bottom-panel {
        position: relative;
        .win {
            position: absolute;
            top: 20px;
            left: 10px;
            right: 10px;
            bottom: 20px;
            z-index: 1;

            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: space-evenly;
            background: hsl(0, 0%, 80%);
            color: hsl(0, 0%, 5%);
            padding: 5px 10px;
            gap: 20px;
            border-radius: 4px;

            > span {
                font-size: 24pt;
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