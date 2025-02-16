<script lang="ts">
    import {type Club} from "./club";
    import Cell from "./Cell.svelte";
    import Dice from "./Dice.svelte";
    import {
        IconBounceRightFilled,
        IconChevronCompactRight,
        IconPlaneTilt
    } from "@tabler/icons-svelte";

    export let enabled = true;
    export let clubs: {club: Club, enabled: boolean}[];
    export let selectedClub: Club|null = null;
    export let onSelect: ((clubData: Club) => void)|null = null;

    function changeClub(clubType: Club) {
        if (clubType !== selectedClub) {
            selectedClub = clubType;
            if (onSelect !== null) onSelect(clubType);
        }
    }
</script>
<ul class="club-selector" class:disabled={!enabled}>
    {#each clubs as {club:club, enabled: clubEnabled}, i}
        <li class:disabled={!clubEnabled || !enabled} class:selected={club === selectedClub}>
            <span class="selection-marker"><IconChevronCompactRight size="30" /></span>
            <button onclick={() => {if (clubEnabled && enabled) changeClub(club)}}>
                <div class="title">
                    <span class="icon"><svelte:component this={club.icon()} stroke="3" size="28"/></span>
                    {club.name()}
                </div>
                <div class="details">
                    <ul class="terrain">
                        {#each club.cellTypes() as allowedCellType}
                            <li><Cell cellType={allowedCellType} size={20} /></li>
                        {/each}
                        {#if !club.sticks()}
                            <li><IconPlaneTilt size={20} /></li>
                        {/if}
                        {#if club.bounces()}
                            <li><IconBounceRightFilled size={20} /></li>
                        {/if}
                    </ul>
                    <ul class="dice-faces">
                        {#each club.diceFaces() as face}
                            <li>
                                <Dice value={face} filled={true} size="35" stroke="1.7" color={face>=club.sliceFrom()?'hsl(20, 60%, 30%)':'hsl(0, 0%, 35%)'} />
                                <div class="overlay"><Dice value={0} filled={true} size="35" stroke="1.7" /></div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </button>
            <span class="key-hint">{i + 1}</span>
        </li>
    {/each}
</ul>
<style>
    .club-selector {
        display: grid;
        grid:
            auto-flow
            / [start] 130px [mid] 1fr [end];
        list-style: none;
        margin: 0;
        padding: 0;
        grid-gap: 4px 10px;

        > li {
            grid-column: start / end;
            display: grid;
            grid-template-columns: subgrid;
            position: relative;

            &.selected {
                > .selection-marker {
                    opacity: 1;
                    transform: translateX(-10px);
                }
                > button {
                    transform: translateX(15px);
                    background: hsl(0, 0%, 95%);
                    filter: brightness(90%);
                }
            }
            &.disabled {
                > button {
                    filter: contrast(0.5) brightness(0.6);
                    transition: transform 0.15s ease, filter 0.15s ease;
                }
                > .key-hint {
                    opacity: 0.08;
                }
            }
            &:not(.disabled) {
                > button {
                    cursor: pointer;
                    &:hover {
                        opacity: 1;
                    }
                }
            }
            &:not(.disabled):not(.selected) {
                > button:hover {
                    transform: translateX(8px);
                    transition: transform 0.7s cubic-bezier(.02,1.5,.1,1);
                }
            }
            > .selection-marker {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: translateX(-30px);
                transition: transform 0.7s cubic-bezier(.02,1.2,.02,1), opacity .1s ease-out;
                pointer-events: none;
            }
            > .key-hint {
                position: absolute;
                left: -5px;
                top: 50%;
                transform: translate(-100%, -50%);
                color: hsl(0, 0%, 100%);
                opacity: 0.15;
                transition: opacity 0.15s ease;
                pointer-events: none;
            }
            > button {
                grid-column: start / end;
                display: grid;
                grid-template-columns: subgrid;
                background: hsl(0, 0%, 80%);
                color: hsl(0, 0%, 5%);
                padding: 0 6px;
                border-radius: 4px;
                transition: transform 0.3s ease, filter 0.3s ease;
                transform: translateX(0);
                border: none;
                filter: brightness(0.85);

                .title {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    gap: 10px;
                    padding: 0 10px;
                    font-size: 18px;
                    > .icon {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        flex: 0 0 auto;
                    }
                }
                .details {
                    flex: 1 1 auto;
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;

                    > ul {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: center;
                        gap: 3px;
                        margin: 0;
                        padding: 2px 0;
                        list-style: none;

                        > li {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }

                        &.dice-faces {
                            > li {
                                position: relative;
                                isolation: isolate;

                                > .overlay {
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    bottom: 0;
                                    right: 0;
                                    background: hsl(0, 0%, 50%);
                                    color: white;
                                    mix-blend-mode: multiply;
                                    filter: blur(3px);
                                    mask: url("lib/extra-dice-icons/dice-0-filled.svg") 0 0/100%;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>