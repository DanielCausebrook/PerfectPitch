<script lang="ts">
    import ClubSelector from "./ClubSelector.svelte";
    import {type Club} from "./club";
    import {CellBlockType, CellType, Course, getCellData} from "./course";
    import Cell from "./Cell.svelte";
    import {Player} from "./player";
    import {SoundEffect} from "./soundEffect";
    import {timeout} from "./utilities";
    import {createInteractAnimation, createSinkAnimation, playWinAnimation} from "./cellAnimation.js";
    import {IconArrowRight, IconChevronCompactUp} from "@tabler/icons-svelte";
    import {on} from "svelte/events";
    import {RectDirection, RectPoint, rotateRectDirection, TiledRectRegion} from "./geometry";


    export let course: Course;
    export let player: Player;

    const listenerRemovers: (() => void)[] = [];

    let cells: TiledRectRegion<HTMLElement> = TiledRectRegion.of(course.bounds(), null) as unknown as TiledRectRegion<HTMLElement>;
    function registerCell(element: HTMLElement, data: RectPoint) {
        cells.set(data, element);
    }

    class DirectionRequest {
        #resolve: (direction: RectDirection) => void;
        #onChange: (request: DirectionRequest) => void;
        dragCenter: RectPoint|null = null;
        currentDragDirection: RectDirection|null = null;
        touchId: number|null = null;
        static readonly deadZone = 35;

        constructor(resolve: (direction: RectDirection) => void, onChange: (request: DirectionRequest) => void) {
            this.#resolve = resolve;
            this.#onChange = onChange;
        }
        #setCurrentDragDirection(direction: RectDirection|null): void {
            if (direction !== this.currentDragDirection) {
                this.currentDragDirection = direction;
                this.#onChange(this);
            }
        }
        dragStart(coordinates: RectPoint, touchId?: number) {
            if (this.dragCenter === null) {
                this.dragCenter = coordinates;
                this.currentDragDirection = null;
                this.touchId = touchId ?? null;
                this.#onChange(this);
            }
        }
        dragMove(coordinates: RectPoint, touchId?: number) {
            if (this.dragCenter !== null && this.touchId === (touchId ?? null)) {
                let vector = coordinates.sub(this.dragCenter);
                let distance = vector.magnitude();

                if (this.currentDragDirection === null && distance < DirectionRequest.deadZone + 5) {
                    return;
                } else if (distance < DirectionRequest.deadZone) {
                    this.#setCurrentDragDirection(null);
                    return;
                }

                let angle = vector.angle();
                let adjustedAngle = (10 - (4 * angle / Math.PI)) % 8;
                if (this.currentDragDirection === null) {
                    this.#setCurrentDragDirection(Math.round(adjustedAngle) % 8);
                } else {
                    // Use a dead zone
                    let angleDirectionDiff = Math.abs(adjustedAngle - Math.round(adjustedAngle));
                    if (angleDirectionDiff < 0.45) {
                        this.#setCurrentDragDirection(Math.round(adjustedAngle) % 8);
                    }
                }
            }
        }
        dragEnd(touchId?: number) {
            if (this.dragCenter !== null && this.touchId === (touchId ?? null)) {
                if (this.currentDragDirection !== null) {
                    this.#resolve(this.currentDragDirection);
                }
                this.dragCenter = null;
                this.currentDragDirection = null;
                this.touchId = null;
                this.#onChange(this);
            }
        }
        dragCancel(touchId?: number) {
            if (this.dragCenter !== null && this.touchId === (touchId ?? null)) {
                this.dragCenter = null;
                this.currentDragDirection = null;
                this.touchId = null;
                this.#onChange(this);
            }
        }
    }
    let directionInputElement: HTMLElement;
    let directionRequest: DirectionRequest|null = null;
    let relativeDragCenter: RectPoint|null = null;
    let currentDragDirection: RectDirection|null = null;
    let cellDirectionHighlights: Map<string, string> = new Map();

    async function selectDirection(): Promise<RectDirection> {
        return new Promise(resolve => {
            directionRequest = new DirectionRequest(
                direction => {
                    directionRequest = null;
                    updateCellDirectionHighlight();
                    resolve(direction);
                },
                request => {
                    if (request.dragCenter === null) {
                        relativeDragCenter = null;
                    } else {
                        let inputElementPos = directionInputElement.getBoundingClientRect();
                        let inputElementPoint = new RectPoint(inputElementPos.left, inputElementPos.top);
                        relativeDragCenter = request.dragCenter.sub(inputElementPoint);
                    }
                    currentDragDirection = request.currentDragDirection;
                    updateCellDirectionHighlight();
                }
            );
        });
    }

    function updateCellDirectionHighlight() {
        cellDirectionHighlights.clear();
        let direction = directionRequest?.currentDragDirection ?? null;
        if (direction === null || selectedClub === null) {
            cellDirectionHighlights = cellDirectionHighlights;
            return;
        }
        let highlightPos = player.position;
        player.clubStatus(selectedClub.type).shotPreviewHighlights().forEach(color => {
            cellDirectionHighlights.set(`[${highlightPos.x}, ${highlightPos.y}]`, color);
            highlightPos = highlightPos.move(direction);
        });
        cellDirectionHighlights = cellDirectionHighlights;
    }

    function registerDirectionInputElement(element: HTMLElement) {
        directionInputElement = element;
        on(element, "mousedown", event => {
            if (event.button === 0 && directionRequest !== null) {
                event.preventDefault();
                directionRequest.dragStart(new RectPoint(event.x, event.y));
            }
        });
        listenerRemovers.push(on(document, "mouseup", event => {
            if (event.button === 0 && directionRequest !== null) {
                event.preventDefault();
                directionRequest.dragEnd();
            }
        }));
        listenerRemovers.push(on(document, "mousemove", event => {
            if (directionRequest !== null) {
                if ((event.buttons & 1) !== 1) {
                    directionRequest.dragEnd();
                }
                directionRequest.dragMove(new RectPoint(event.x, event.y));
            }
        }));
        element.addEventListener("touchstart", event => {
            if (directionRequest !== null) {
                event.preventDefault();
                let touch = event.changedTouches[0];
                directionRequest.dragStart(new RectPoint(touch.clientX, touch.clientY), touch.identifier);
            }
        });
        listenerRemovers.push(on(document, "touchend", event => {
            if (directionRequest !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        directionRequest.dragEnd(changedTouch.identifier);
                    }
                }
            }
        }));
        listenerRemovers.push(on(document, "touchcancel", event => {
            if (directionRequest !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        directionRequest.dragCancel(changedTouch.identifier);
                    }
                }
            }
        }));
        listenerRemovers.push(on(document, "touchmove", event => {
            if (directionRequest !== null && directionRequest.touchId !== null) {
                for (const changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === directionRequest.touchId) {
                        event.preventDefault();
                        directionRequest.dragMove(new RectPoint(changedTouch.clientX, changedTouch.clientY), changedTouch.identifier);
                    }
                }
            }
        }));
    }

    type ClubRequest = { resolve: (clubData: Club) => void };
    let clubRequest: ClubRequest|null = null;

    let enableClubSelect = false;
    let selectedClub: Club|null = null;
    const onSelectClub: (club: Club) => void = club => {
        updateCellDirectionHighlight();
        SoundEffect.select.play();
        clubRequest?.resolve(club);
    };
    let advanceClubLockout: () => void;
    let rerollClubs: () => void;

    let win: boolean = false;
    let showBall: boolean = true;

    async function takeTurn() {
        if (selectedClub !== null && !selectedClub.canUseOn(course.cell(player.position))) {
            selectedClub = null;
        }
        rerollClubs();
        enableClubSelect = true;
        if (selectedClub === null) {
            selectedClub = await new Promise<Club>(resolve => {
                clubRequest = {resolve: resolve};
            });
        }

        let direction = await selectDirection();
        enableClubSelect = false;
        let clubForShot = selectedClub;
        clubForShot.soundEffect(course.cell(player.position)).play();
        player.addStroke();

        advanceClubLockout();
        let clubStatus = player.clubStatus(selectedClub.type);
        let stroke = clubStatus.next();
        if (stroke === null) {
            throw new Error("Dice roll is null");
        }
        let {distance: movementRemaining, sliceValues: sliceValues} = stroke;
        if (!player.clubStatus(selectedClub.type).isAvailable()) {
            selectedClub = null;
        }
        player = player;

        let distanceMoved = 0;
        let distanceBounced = 0;
        let slicedYet = false;

        function updatePosition(pos: RectPoint) {
            player.position = pos;
        }

        let startingPosition = player.position;
        if (!clubForShot.noShotModifier()) {
            movementRemaining += getCellData(course.cell(startingPosition)).shotModifier;
        }

        while (movementRemaining > 0) {
            movementRemaining--;
            distanceMoved++;
            let slice = sliceValues.shift() ?? 0;
            if (!slicedYet && distanceMoved >= clubForShot.sliceFrom() && distanceBounced === 0 && slice !== 0) {
                direction = rotateRectDirection(direction, slice);
                slicedYet = true;
            }
            let newPosition = player.position.move(direction);
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
                createInteractAnimation(cellData.primaryColor, 1, rotateRectDirection(direction, 2))
                    .play(cells.get(newPosition));
                cellData.blockSoundEffect?.play();
                movementRemaining = 0;
                break;
            } else if (cellData.blockType === CellBlockType.Stick && clubForShot.sticks()) {
                updatePosition(newPosition);
                await timeout(200);
                if (movementRemaining > 0) {
                    createInteractAnimation(cellData.primaryColor, 1, rotateRectDirection(direction, 2))
                        .play(cells.get(newPosition));
                    cellData.blockSoundEffect?.play();
                }
                movementRemaining = 0;
                break;
            }
            updatePosition(newPosition);
            if (movementRemaining === 0 && distanceBounced < cellData.rollDistance && clubForShot.bounces()) {
                createInteractAnimation(cellData.primaryColor, 0.5, direction).play(cells.get(newPosition));
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
            player.addStroke();
            player = player;
            await createSinkAnimation(cellData.primaryColor, direction)
                .play(cells.get(player.position));
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
        <div class="grid" use:registerDirectionInputElement style="grid: repeat({course.height()}, 1fr) / repeat({course.width()}, 1fr);">
            {#each {length: course.height()} as _, y}
                {#each {length: course.width()} as _, x}
                    {@const highlight = cellDirectionHighlights.get(`[${[x, y][0]}, ${[x, y][1]}]`) ?? null}
                    <div class="cell" class:direction-highlight={highlight !== null} style="{highlight !== null ? `outline-color: ${highlight}; `: ''}" use:registerCell={new RectPoint(x, y)}>
                        {#key course}
                            <Cell size={20} cellType={course === null ? CellType.Water : course.cell(new RectPoint(x, y))} hasBall={course !== null && showBall && player.position.x === x && player.position.y === y} />
                        {/key}
                        <div class="glow-element"></div>
                    </div>
                {/each}
            {/each}
            {#if relativeDragCenter !== null}
                <div class="drag-center" style="left: {relativeDragCenter.x}px; top: {relativeDragCenter.y}px;">
                    {#if currentDragDirection !== null}
                        <div class="drag-arrow-rotation" style="transform: rotate({180-currentDragDirection*45}deg);">
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
                bind:player={player}
                course={course}
                enabled={enableClubSelect}
                bind:selectedClub={selectedClub}
                onSelect={onSelectClub}
                bind:advanceLockout={advanceClubLockout}
                bind:rerollAll={rerollClubs}
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
    .board {
        flex: 0 0 auto;
        align-self: center;
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
        z-index: 1;

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