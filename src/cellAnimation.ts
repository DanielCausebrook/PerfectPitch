import {Direction, type Position} from "./course";
import {timeout} from "./utilities";
import type {Matrix2D} from "./terrainGeneration";

export function rotateDirection(direction: Direction, angle: number): Direction {
    return (((direction + angle) % 8) + 8) % 8;
}

export function getUnitVector(direction: Direction): Position {
    switch (direction) {
        case Direction.N:
            return [0, 1];
        case Direction.NE:
            return [1, 1];
        case Direction.E:
            return [1, 0];
        case Direction.SE:
            return [1, -1];
        case Direction.S:
            return [0, -1];
        case Direction.SW:
            return [-1, -1];
        case Direction.W:
            return [-1, 0];
        case Direction.NW:
            return [-1, 1];
    }
}

class CellAnimationComponent {
    #keyframes: Keyframe[];
    #durationMs: number;
    #onGlowElement: boolean;

    constructor(keyframes: Keyframe[], durationMs: number, onGlowElement?: boolean) {
        this.#keyframes = keyframes;
        this.#durationMs = durationMs;
        this.#onGlowElement = onGlowElement ?? false;
    }

    play(cell: HTMLElement) {
        if (this.#onGlowElement) {
            cell.querySelector('.glow-element')?.animate(this.#keyframes, {
                duration: this.#durationMs,
                iterations: 1,
            });
        } else {
            cell.animate(this.#keyframes, {
                duration: this.#durationMs,
                iterations: 1,
            });
        }
    }

    duration() {
        return this.#durationMs;
    }
}

export class CellAnimation {
    #components: CellAnimationComponent[];

    constructor(components: CellAnimationComponent[]) {
        this.#components = components;
    }

    play(cell: HTMLElement): Promise<void> {
        let duration = 0;
        for (const component of this.#components) {
            component.play(cell);
            duration = Math.max(duration, component.duration());
        }
        return timeout(duration);
    }

    static #rotationAxis(direction: Direction) {
        return getUnitVector(rotateDirection(direction, 2));
    }

    static combine(...animations: CellAnimation[]): CellAnimation {
        return new CellAnimation(animations.reduce((combined, animation) => {
            combined.push(...animation.#components);
            return combined;
        }, [] as CellAnimationComponent[]));
    }

    static glow(color: string, spread: number, durationMs: number): CellAnimation {
        return new CellAnimation([
            new CellAnimationComponent([
                {boxShadow: `0 0 ${spread}px ${spread / 2}px transparent`, easing: 'ease-out'},
                {boxShadow: `0 0 ${spread}px ${spread / 2}px ${color}`, easing: 'ease-in', offset: 0.02},
                {boxShadow: `0 0 ${spread}px ${spread / 2}px transparent`},
            ], durationMs, true),
        ]);
    }

    static wobble(direction: Direction, initialRotation: number, durationMs: number): CellAnimation {
        const strikeOffset = 0.05;
        const decay = 0.625;
        const numWobbles = 6;
        const axis = this.#rotationAxis(direction);
        let animation: Keyframe[] = [
            {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`, easing: 'ease-out'},
            {
                transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${initialRotation}deg)`,
                offset: strikeOffset,
                easing: `cubic-bezier(.42,0,.58,1)`,
            },
        ];
        for (let i = 1; i < numWobbles; i++) {
            animation.push({
                transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${initialRotation * Math.pow(-decay, i)}deg)`,
                offset: strikeOffset + i * (1 - strikeOffset) / numWobbles,
                easing: `cubic-bezier(.42,0,.58,1)`,
            });
        }
        animation.push({transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`})
        return new CellAnimation([
            new CellAnimationComponent(animation, durationMs),
        ])
    }

    static spin(direction: Direction, durationMs: number): CellAnimation {
        let axis = this.#rotationAxis(direction);
        return new CellAnimation([
            new CellAnimationComponent([
                {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, 0deg)`, easing: 'cubic-bezier(0, 0.2, 0, 1)'},
                {transform: `rotate3d(${axis[0]}, ${-axis[1]}, 0, ${360 * 4}deg)`},
            ], durationMs),
        ])
    }
}

export function createInteractAnimation(color: string, intensity: number, direction: Direction): CellAnimation {
    return CellAnimation.combine(
        CellAnimation.wobble(direction, 75*intensity, 1000),
        CellAnimation.glow(color, 15*intensity, 1000)
    );
}
export function createSinkAnimation(color: string, direction: Direction): CellAnimation {
    return CellAnimation.combine(
        CellAnimation.spin(direction, 1000),
        CellAnimation.glow(color, 20, 1000)
    );
}
export function playWinAnimation(center: Position, cells: Matrix2D<HTMLElement>): Promise<void> {
    const duration = 5000;
    CellAnimation.glow('hsl(170, 80%, 60%)', 40, duration).play(cells.data[center[0]][center[1]]);
    for (let x = 0; x < cells.width; x++) {
        for (let y = 0; y < cells.height; y++) {
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
            cells.data[x][y].animate(animation, timing);
        }
    }
    return timeout(duration);
}