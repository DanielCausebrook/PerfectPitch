<script lang="ts">
    import {onMount} from "svelte";
    import {CellType, getCellData} from "../../course";
    import {MersenneTwister19937, Random} from "random-js";
    import {
        createTerrainDebugSettings, DebugMap,
        generateTeeAndHolePos, generateTerrainDebug,
        TerrainDebugBool, TerrainDebugRadioGroup,
    } from "../../terrainGeneration";
    import {TerrainDebugNumber} from "../../terrainGeneration.js";

    let canvases: {element: HTMLCanvasElement|null}[] = Array(24).fill(null).map(() => {return {element: null}});
    let seed = MersenneTwister19937.autoSeed().next();
    const width = 20;
    const height = 20;
    const detail = 5;
    const cellDimensions = 10;

    const debugSettings = createTerrainDebugSettings();

    function renderMap(map: CellType[][]|DebugMap, ctx: CanvasRenderingContext2D) {
        if (map instanceof DebugMap) {
            map.map.forEach((col, x) => col.forEach((value, y) => {
                let numValue = 0;
                if (typeof value == "number") {
                    numValue = value;
                } else if (typeof value == "boolean") {
                    numValue = value ? 1 : -1;
                }
                if (numValue < 0) {
                    ctx.fillStyle = `hsl(0, 50%, ${-Math.min(1, -numValue)*50 + 100}%)`;
                } else {
                    ctx.fillStyle = `hsl(240, 50%, ${-Math.min(1, numValue)*50 + 100}%)`;
                }
                ctx.fillRect(x*cellDimensions, y*cellDimensions, cellDimensions, cellDimensions);
            }));
        } else {
            map.forEach((col, x) => col.forEach((cell, y) => {
                ctx.fillStyle = getCellData(cell).primaryColor;
                ctx.fillRect(x*cellDimensions, y*cellDimensions, cellDimensions, cellDimensions);
            }));
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
                let [teePos, holePos] = generateTeeAndHolePos(width, height, new Random(MersenneTwister19937.seed(rng.uint32())));
                let map = generateTerrainDebug(width, height, teePos,  holePos, new Random(MersenneTwister19937.seed(rng.uint32())), debugSettings);
                renderMap(map, ctx);
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
                width: 150px;

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