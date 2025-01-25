<script lang="ts">

    import {type Course, Direction, getCellData, moveInDirection} from "./course";
    import {ClubType, getClubData, type Player} from "./player";
    import Cell from "./Cell.svelte";
    import {timeout} from "./utilities";

    export let course: Course;
    export let ballPos: [number, number]|null = null;
    export let selectedClub: ClubType|null;

    function createEmptyCellButtons() {
        let arr = [];
        for (let i = 0; i < course.width(); i++) {
            arr.push(Array(course.height()).fill(null));
        }
        return arr;
    }

    let cellButtons: ({listener: () => void, direction: Direction}|null)[][] = createEmptyCellButtons();
    let shotModifier: number = 0;
    let cellElements: HTMLElement[][] = Array(course.width()).map(() => Array(course.height()));

    export const selectDirection = (player: Player): Promise<Direction> => {
        shotModifier = (selectedClub !== null && getClubData(selectedClub).noShotModifier()) ? 0 : getCellData(course.cell(player.position)).shotModifier;
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

    function registerCell(element: HTMLElement, data: [number, number]) {
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

    export const sinkAnimation = (center: [number, number]) => {
        const duration = 5000;
        for (let x = 0; x < course.width(); x++) {
            for (let y = 0; y < course.height(); y++) {
                if (x === center[0] && y === center[1]) {
                    let glowAnimation = [
                        {boxShadow: '0 0 40px 10px hsla(180, 80%, 60%, 0%)', easing: 'ease-out'},
                        {boxShadow: '0 0 40px 10px hsla(180, 80%, 60%, 100%)', easing: 'ease-in', offset: 0.02},
                        {boxShadow: '0 0 40px 10px hsla(180, 80%, 60%, 0%)'},
                    ];

                    cellElements[x][y].animate(glowAnimation, {
                        duration: duration,
                        iterations: 1,
                    })
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

    export const splashAnimation = (center: [number, number], direction: Direction): Promise<void> => {
        const computeRotationAxis = (direction: Direction) => {
            switch (direction) {
                case Direction.N: return [1, 0];
                case Direction.NE: return [1, -1];
                case Direction.E: return [0, -1];
                case Direction.SE: return [-1, -1];
                case Direction.S: return [-1, 0];
                case Direction.SW: return [-1, 1];
                case Direction.W: return [0, 1];
                case Direction.NW: return [1, 1];
            }
        };
        let axis = computeRotationAxis(direction);
        let animation = [
            {transform: `rotate3d(${axis[0]}, ${axis[1]}, 0, 0deg)`, easing: 'cubic-bezier(0, 0.2, 0, 1)'},
            {transform: `rotate3d(${axis[0]}, ${axis[1]}, 0, ${360*4}deg)`},
        ];
        let glowAnimation = [
            {boxShadow: '0 0 20px 10px hsla(240, 40%, 60%, 0%)', easing: 'ease-out'},
            {boxShadow: '0 0 20px 10px hsla(240, 40%, 60%, 100%)', easing: 'ease-in', offset: 0.02},
            {boxShadow: '0 0 20px 10px hsla(240, 40%, 60%, 0%)', offset: 0.6},
        ];
        let timings = {
            duration: 1000,
            iterations: 1,
        };
        cellElements[center[0]][center[1]].animate(animation, timings);
        cellElements[center[0]][center[1]].animate(glowAnimation, timings);
        return timeout(1000);
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

                &.direction-button {
                    outline: 1px solid white;
                    cursor: pointer;
                    &:hover {
                        filter: brightness(1.2);
                    }
                }
            }
        }
    }
</style>