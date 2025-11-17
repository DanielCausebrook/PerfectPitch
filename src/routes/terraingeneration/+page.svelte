<script lang="ts">
    import {onMount} from "svelte";
    import {CellType, getCellData} from "../../course";
    import {MersenneTwister19937, Random} from "random-js";
    import {
        generateHexTerrainDebug, generateTeeAndHolePos,
        generateRectTerrainDebug,
    } from "../../terrainGeneration";
    import {
        HexPoint2D,
        type Point2D,
        RectPoint2D,
    } from "$lib/maths/point2D";
    import {HexRegion2D, HexTiling2D, RectTiling2D, type Tile, type Tiling2D} from "$lib/maths/tiling2D";
    import {
        createTerrainDebugSettings,
        DebugMap,
        TerrainDebugBool,
        TerrainDebugNumber,
        TerrainDebugRadioGroup
    } from "$lib/terrainDebug";
    import {generateOldRectTerrainDebug} from "../../terrainGenerationOld";

    let canvases: {element: HTMLCanvasElement|null}[] = Array(24).fill(null).map(() => {return {element: null}});
    let seed = MersenneTwister19937.autoSeed().next();
    const width = 30;
    const height = 32;
    const xEdge = 2;
    const yEdge = 3;
    const detail = 5;
    const cellDimensions = 7;

    const debugSettings = createTerrainDebugSettings();

    const HEX_SCALE = 0.62;

    function hexPointToPixelPos(hexPoint: HexPoint2D, bounds: HexRegion2D): RectPoint2D {
        const offset = new RectPoint2D(-bounds.qMin*1.6, -bounds.sMin*1.85);
        return hexPoint.toRect().add(offset).mult(HEX_SCALE*cellDimensions);

    }

    function renderHexagon(center: Point2D, r: number, fill: string, ctx: CanvasRenderingContext2D) {
        const p = center.toRect();
        ctx.beginPath();
        for(let i = 0; i < 6; i++) {
            let angle = i * Math.PI/3;
            ctx.lineTo(p.x + r * Math.cos(angle), p.y + r * Math.sin(angle));
        }
        ctx.closePath();

        ctx.fillStyle = fill;
        ctx.fill()
    }

    function renderMap<T extends Tile>(map: Tiling2D<T, CellType>|DebugMap<T>, teePos: Point2D, ctx: CanvasRenderingContext2D) {
        if (map instanceof DebugMap) {
            if (map.map instanceof RectTiling2D) {
                map.map.forEach((value, p) => {
                    let numValue = 0;
                    let outOfRange = false;
                    if (typeof value == "number") {
                        numValue =  Math.max(0, Math.min(1, value));

                        if (value > 1 || value < 0) {
                            outOfRange = true;
                        }
                    } else if (typeof value == "boolean") {
                        numValue = value ? 1 : 0;
                    }

                    ctx.fillStyle = `color-mix(in oklch, hsl(0, 50%, 50%) ${numValue * 100}%, hsl(240, 50%, 50%))`;
                    ctx.fillRect(p.x * cellDimensions, p.y * cellDimensions, cellDimensions, cellDimensions);

                    if (outOfRange) {
                        ctx.fillStyle = 'black';
                        ctx.beginPath();
                        ctx.arc((p.x + 0.5) * cellDimensions, (p.y + 0.5) * cellDimensions, cellDimensions/8, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.fill();
                    }
                });
            } else if (map.map instanceof HexTiling2D) {
                map.map.forEach((value, p) => {
                    let numValue = 0;
                    let outOfRange = false;
                    if (typeof value == "number") {
                        numValue =  Math.max(0, Math.min(1, value));

                        if (value > 1 || value < 0) {
                            outOfRange = true;
                        }
                    } else if (typeof value == "boolean") {
                        numValue = value ? 1 : 0;
                    }
                    const fill = `color-mix(in oklch, hsl(0, 50%, 50%) ${numValue * 100}%, hsl(240, 50%, 50%))`;
                    const pixelP = hexPointToPixelPos(p, map.map.bounds as HexRegion2D);
                    renderHexagon(hexPointToPixelPos(p, map.map.bounds as HexRegion2D), HEX_SCALE*cellDimensions, fill, ctx);

                    if (outOfRange) {
                        ctx.fillStyle = 'black';
                        ctx.beginPath();
                        ctx.arc(pixelP.x, pixelP.y, cellDimensions/8, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.fill();
                    }
                });

            } else {
                throw new Error("Cannot render this type of tiled region.");
            }
        } else {
            if (map instanceof RectTiling2D) {
                map.forEach((cell, p) => {
                    ctx.fillStyle = getCellData(cell).primaryColor;
                    ctx.fillRect(p.x*cellDimensions, p.y*cellDimensions, cellDimensions, cellDimensions);
                });

                ctx.fillStyle = 'white';
                ctx.beginPath();
                const pixelP = teePos.toRect().add(new RectPoint2D(0.5, 0.5)).mult(cellDimensions);
                ctx.arc(pixelP.x, pixelP.y, cellDimensions/4, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
            } else if (map instanceof HexTiling2D) {
                map.forEach((cell, p) => {
                    const fill = getCellData(cell).primaryColor;
                    renderHexagon(hexPointToPixelPos(p, map.bounds), HEX_SCALE*cellDimensions, fill, ctx)
                });

                ctx.fillStyle = 'white';
                ctx.beginPath();
                const pixelP = hexPointToPixelPos(teePos.toHex(), map.bounds);
                ctx.arc(pixelP.x, pixelP.y, cellDimensions/4, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
            } else {
                throw new Error("Cannot render this type of tiled region.");
            }
        }
    }

    function updateDebugSetting(id: string, value: any) {
        let setting = debugSettings.setting(id);
        if (setting !== null) {
            setting.value = value;
        }
        renderAllMaps();
    }

    function renderAllMaps() {
        let rng = new Random(MersenneTwister19937.seed(seed));
        for (const canvas of canvases) {
            let canvasElem = canvas.element;
            let ctx = canvasElem?.getContext("2d") ?? null;
            if (canvasElem !== null && ctx !== null) {
                ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
                let generator = debugSettings.get('generator');
                if (generator === 'hex') {
                    let north = Math.PI/2;
                    let angleRange = Math.PI/2;
                    let holeAngle = north + rng.real(-angleRange/2, angleRange/2) + (rng.bool() ? Math.PI : 0);
                    let teeAngle = holeAngle + Math.PI + rng.real(-angleRange/2, angleRange/2);
                    let holePos = RectPoint2D.fromPolar(rng.real(1.7*width/5, 2.2*width/5), holeAngle).toHex().toCell();
                    let teePos = RectPoint2D.fromPolar(rng.real(1.7*width/5, 2.2*width/5), teeAngle).toHex().toCell();
                    let map = generateHexTerrainDebug(Math.round(width*0.5), teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())), debugSettings);
                    renderMap(map, teePos, ctx);
                } else if (generator === 'rect') {
                    let [teePos, holePos] = generateTeeAndHolePos(width, height, xEdge, yEdge, new Random(MersenneTwister19937.seed(rng.uint32())));
                    let map = generateRectTerrainDebug(width, height, teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())), debugSettings);
                    renderMap(map, teePos, ctx);
                } else if (generator === 'old') {
                    let [teePos, holePos] = generateTeeAndHolePos(width, height, xEdge, yEdge, new Random(MersenneTwister19937.seed(rng.uint32())));
                    let map = generateOldRectTerrainDebug(width, height, xEdge, yEdge, teePos, holePos, new Random(MersenneTwister19937.seed(rng.uint32())), debugSettings);
                    renderMap(map, teePos, ctx);
                } else {
                    throw new Error("Unknown generator type.");
                }
            }
        }
    }

    onMount(() => {
        renderAllMaps();
    })
</script>

<main>
    <div class="canvas-container">
        {#each canvases as canvas}
            <canvas bind:this={canvas.element} width={width*cellDimensions} height={height*cellDimensions}></canvas>
        {/each}
    </div>
    <div class="controls">
        {#each debugSettings.settings as debugSetting}
            {#if debugSetting instanceof TerrainDebugBool}
                <div class="bool">
                    <label for={debugSetting.id}>{debugSetting.name}</label>
                    <input type="checkbox" id={debugSetting.id} bind:checked={debugSetting.value} onchange={renderAllMaps}>
                </div>
            {:else if debugSetting instanceof TerrainDebugNumber}
                <div class="number">
                    <label for={debugSetting.id}>{debugSetting.name}</label>
                    <input type="range" id={debugSetting.id} min={debugSetting.sliderMin} max={debugSetting.sliderMax} step={debugSetting.sliderStep} bind:value={debugSetting.value} onchange={renderAllMaps}>
                    <span>{debugSetting.value}</span>
                </div>
            {:else if debugSetting instanceof TerrainDebugRadioGroup}
                <div class="radio-label">{debugSetting.name}</div>
                {#each debugSetting.options as option}
                    <div class="radio">
                        <input type="radio" id={debugSetting.id + '-' + option.id} name={debugSetting.id} onclick={() => updateDebugSetting(debugSetting.id, option.id)} checked={option.id === debugSetting.value} />
                        <label for={debugSetting.id + '-' + option.id} >{option.name}</label>
                    </div>
                {/each}
            {/if}
        {/each}
    </div>
</main>

<style>
    main {
        flex: 1 1 auto;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        height: 100%;


        > .canvas-container {
            flex: 0 1 auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            place-items: center;
            gap: 1rem;
            overflow: scroll;

            > canvas {
            }
        }
        > .controls {
            align-self: center;
            display: flex;
            flex-flow: column wrap;
            align-content: center;
            gap: 0 30px;
            padding: 10px 50px;
            height: 220px;

            > div {
                display: flex;
                flex-flow: row nowrap;
                gap: 5px;
                margin-top: 8px;
                width: 160px;

                &.radio {
                    margin-left: 3px;
                    padding-left: 5px;
                    border-left: 1px solid white;
                }
                &.radio + .radio {
                    margin-top: 0;
                }
                &.radio-label + .radio {
                    margin-top: 0;
                }
                &.number {
                    > span {
                        width: 5ch;
                    }
                    > input {
                        flex: 1 1 auto;
                        width: 80px;
                    }
                }
            }
        }
    }
</style>