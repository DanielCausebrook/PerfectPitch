<script lang="ts">

    import {
        CellAnimation,
        type Course,
        Direction,
        getCellData,
        getUnitVector,
        moveInDirection,
        type Position
    } from "./course";
    import {ClubType, getClubData} from "./club";
    import Cell from "./Cell.svelte";
    import type {Player} from "./player";
    import {rotateDirection} from "./course.js";

    export let course: Course;
    export let ballPos: Position|null = null;

    function createEmptyCellButtons() {
        let arr = [];
        for (let i = 0; i < course.width(); i++) {
            arr.push(Array(course.height()).fill(null));
        }
        return arr;
    }

    let cellButtons: ({listener: () => void, direction: Direction}|null)[][] = createEmptyCellButtons();
    let cellElements: HTMLElement[][] = Array(course.width()).map(() => Array(course.height()));

    export const selectDirection = (player: Player): Promise<Direction> => {
        return new Promise(resolve => {
            for (const direction of [Direction.N, Direction.NE, Direction.E, Direction.SE, Direction.S, Direction.SW, Direction.W, Direction.NW]) {
                let position = moveInDirection(player.position, direction);
                if (course.isValidPosition(position)) {
                    cellButtons[position[0]][position[1]] = {
                        listener: () => {
                            cellButtons = createEmptyCellButtons();
                            resolve(direction);
                        },
                        direction: direction,
                    };
                }
            }
        });
    };

    function registerCell(element: HTMLElement, data: Position) {
        if (cellElements[data[0]] === undefined) {
            cellElements[data[0]] = Array(course.width());
        }
        cellElements[data[0]][data[1]] = element;
    }

    function directionClass(direction?: Direction): string|null {
        const p = 'direction-button-';
        switch (direction) {
            case Direction.N: return p+'n';
            case Direction.NE: return p+'ne';
            case Direction.E: return p+'e';
            case Direction.SE: return p+'se';
            case Direction.S: return p+'s';
            case Direction.SW: return p+'sw';
            case Direction.W: return p+'w';
            case Direction.NW: return p+'nw';
            case undefined: return null;
        }
    }

    function rotationAxis(direction: Direction) {
        return getUnitVector(rotateDirection(direction, 2));
    }

    export const winAnimation = (center: Position) => {
        const duration = 5000;
        playAnimation(center, CellAnimation.glow('hsl(170, 80%, 60%)', 40, duration));
        for (let x = 0; x < course.width(); x++) {
            for (let y = 0; y < course.height(); y++) {
                if (x === center[0] && y === center[1]) {
                    continue;
                }
                let radius = [center[0] - x, center[1] - y];
                let tangent = [radius[1], -radius[0]];
                let distance = Math.hypot(...radius);

                let intensity = Math.pow((distance+0.2+Math.random())*0.012, -0.55);
                let spin = 180 * intensity;
                let spinAdjustment = spin % 360;
                let end = spin - spinAdjustment;
                let adjustmentAmount = (end===0 ? 0 : spinAdjustment/end);
                let startOffset = Math.pow(distance*0.5, 1.3)/200;
                let animation = [
                    {transform: `rotate3d(${tangent[0]}, ${tangent[1]}, 0, 0deg)`},
                    {transform: `rotate3d(${tangent[0]}, ${tangent[1]}, 0, 0deg)`, easing: `cubic-bezier(${0.12 * adjustmentAmount}, ${1 + adjustmentAmount * 1.65}, ${0.8 - 0.35*adjustmentAmount}, ${1 - adjustmentAmount*0.5})`, offset: startOffset*0.9},
                    {transform: `rotate3d(${tangent[0]}, ${tangent[1]}, 0, ${end}deg)`, offset: 0.9},
                    {transform: `rotate3d(${tangent[0]}, ${tangent[1]}, 0, ${end}deg)`},
                ];
                const timing = {
                    duration: duration,
                    iterations: 1,
                };
                cellElements[x][y].animate(animation, timing);
            }
        }
    }

    export const playAnimation = (pos: Position, animation: CellAnimation) => {
        animation.play(cellElements[pos[0]][pos[1]]);
    }
</script>

<div class="course">
    {#each { length: course.width() } as _, x}
        <div class="col">
            {#each { length: course.height() } as _, yInv}
                {@const y = course.height() - yInv - 1}
                {@const cellType = course.cell([x, y])}
                {@const buttonInfo = cellButtons[x][y] ?? null}
                <div
                        class={['cell', (buttonInfo !== null) ? 'direction-button' : null, directionClass(buttonInfo?.direction)]} on:click={() => buttonInfo?.listener()}
                        use:registerCell={[x, y]}
                >
                    <Cell cellType={cellType} hasBall={ballPos !== null && ballPos[0] === x && ballPos[1] === y} />
                    <div class="glow-element"></div>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .course {
        display: flex;
        flex-flow: row nowrap;
        gap: 3px;
        justify-content: center;
        .col {
            display: flex;
            flex-flow: column nowrap;
            gap: 3px;
            justify-content: center;

            .cell {
                border-radius: 3px;
                transform-origin: center;
                position: relative;

                &.direction-button {
                    outline: 1px solid white;
                    cursor: pointer;
                    &:hover {
                        filter: brightness(1.2);
                    }
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
        }
    }
</style>