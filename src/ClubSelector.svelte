<script lang="ts">
    import {type ClubData} from "./club";
    import Cell from "./Cell.svelte";
    import Dice from "./Dice.svelte";
    import {
        IconBounceRightFilled,
        IconChevronCompactRight,
        IconPlaneTilt
    } from "@tabler/icons-svelte";

    export let enabled = true;
    export let clubs: {data: ClubData, enabled: boolean}[];
    export let selectedClub: ClubData|null = null;
    export let onSelect: ((clubData: ClubData) => void)|null = null;

    function changeClub(clubType: ClubData) {
        if (clubType !== selectedClub) {
            selectedClub = clubType;
            if (onSelect !== null) onSelect(clubType);
        }
    }
</script>
<ul class="club-selector" class:disabled={!enabled}>
    {#each clubs as club}
        <li class:disabled={!club.enabled || !enabled} class:selected={club.data === selectedClub}>
            <span class="selection-marker"><IconChevronCompactRight size="30" /></span>
            <button onclick={() => {if (club.enabled && enabled) changeClub(club.data)}}>
                <div class="title">
                    <span class="icon"><svelte:component this={club.data.icon()} stroke="3" size="28"/></span>
                    {club.data.name()}
                </div>
                <div class="details">
                    <ul class="terrain">
                        {#each club.data.cellTypes() as allowedCellType}
                            <li><Cell cellType={allowedCellType} size={20} borderRadius={6} /></li>
                        {/each}
                        {#if !club.data.sticks()}
                            <li><IconPlaneTilt size={20} /></li>
                        {/if}
                        {#if club.data.bounces()}
                            <li><IconBounceRightFilled size={20} /></li>
                        {/if}
                    </ul>
                    <ul class="dice-faces">
                        {#each club.data.diceFaces() as face}
                            <li>
                                <Dice value={face} filled={true} size="35" stroke="1.7" color={face < 5 ? 'hsl(0, 0%, 35%)' : 'hsl(20, 60%, 30%)'} />
                                <div class="overlay"><Dice value={0} filled={true} size="35" stroke="1.7" /></div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </button>
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
        padding: 0 5px 0 0;
        grid-gap: 4px 10px;

        > li {
            grid-column: start / end;
            display: grid;
            grid-template-columns: subgrid;
            position: relative;

            &.selected.selected.selected {
                > .selection-marker {
                    opacity: 1;
                    transform: translateX(-10px);

                }
                > button {
                    transform: translateX(15px);
                    background: hsl(0, 0%, 95%);
                    opacity: 0.9;
                }
            }
            &.disabled {
                > button {
                    opacity: 0.6;
                    filter: contrast(0.5);
                    transition: transform 0.15s ease, opacity 0.15s ease;
                }
            }
            &:not(.disabled) {
                > button {
                    cursor: pointer;
                    &:hover {
                        transform: translateX(8px);
                        opacity: 1;
                        transition: transform 0.7s cubic-bezier(.02,1.5,.1,1);
                    }
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
            }
            > button {
                grid-column: start / end;
                display: grid;
                grid-template-columns: subgrid;
                background: hsl(0, 0%, 80%);
                color: hsl(0, 0%, 5%);
                padding: 0 6px;
                border-radius: 4px;
                transition: transform 0.3s ease, opacity 0.3s ease;
                transform: translateX(0);
                border: none;
                opacity: 0.85;

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