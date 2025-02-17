<script lang="ts">
    import {type Club, clubs, ClubType} from "./club";
    import Cell from "./Cell.svelte";
    import Dice from "./Dice.svelte";
    import {
        IconBounceRightFilled,
        IconChevronCompactRight,
        IconPlaneTilt
    } from "@tabler/icons-svelte";
    import {onMount} from "svelte";
    import {on} from "svelte/events";
    import type {Player} from "./player";
    import type {Course} from "./course";

    export let enabled = true;
    export let player: Player;
    export let course: Course;
    export let selectedClub: Club|null = null;
    export let onSelect: ((clubData: Club) => void)|null = null;

    let clubSpinners: Map<ClubType, HTMLElement> = new Map();
    function registerClubSpinner(element: HTMLElement, data: Club) {
        clubSpinners.set(data.type, element);
    }

    function isClubEnabled(club: Club) {
        return enabled && club.canUseOn(course.cell(player.position));
    }

    function isClubOutOfShots(club: Club) {
        return player.clubStatus(club.type).current() === null;
    }

    function changeClub(club: Club) {
        if (club !== selectedClub) {
            selectedClub = club;
            if (onSelect !== null) onSelect(club);
        }
    }

    function clickClub(club: Club) {
        if (isClubEnabled(club)) {
            if (isClubOutOfShots(club)) {
                let buttonSpinner = clubSpinners.get(club.type);
                if (buttonSpinner !== undefined) {
                    player.clubStatus(club.type).shuffle();
                    player.addStroke();
                    player = player;
                    changeClub(club);
                    buttonSpinner.animate([
                        {transform: "rotate3d(1, 0, 0, 0deg)", offset: 0, easing: "ease-out"},
                        {transform: "rotate3d(1, 0, 0, 360deg)", offset: 1},
                    ], {
                        duration: 500,
                        iterations: 1,
                    });
                }
            } else {
                changeClub(club);
            }
        }
    }

    const clubSelectEventListener: (this:Document, event: KeyboardEvent) => any = event => {
        if (enabled) {
            clubs.values().forEach((club, i) => {
                if (
                    event.key === (i+1).toString()
                    && club.canUseOn(course.cell(player.position))
                    && player.clubStatus(club.type).current() !== null
                ) {
                    clickClub(club);
                    return;
                }
            });
        }
    };

    onMount(() => {
        let listenerRemover = on(document, 'keypress', clubSelectEventListener);
        return () => {
            listenerRemover();
        }
    });
</script>
<ul class="club-selector" class:disabled={!enabled}>
    {#each clubs.values() as club, i}
        {@const clubEnabled = isClubEnabled(club)}
        {@const clubStatus = player.clubStatus(club.type)}
        <li class:disabled={!clubEnabled} class:selected={club === selectedClub}>
            <span class="selection-marker"><IconChevronCompactRight size="30" /></span>
            <div class="reroll-spinner" use:registerClubSpinner="{club}">
            <button onclick={() => clickClub(club)} class:out-of-shots={isClubOutOfShots(club)}>
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
                    <div class="dice-faces">
                        {#each clubStatus.faces() as face, i}
                            <div class="dice-face" class:used={i<clubStatus.currentFaceIndex()} class:next={i===clubStatus.currentFaceIndex()} class:unused={i>clubStatus.currentFaceIndex()}>
                                <div class="dice-wrapper">
                                    <Dice value={face} filled={true} size="35" stroke="1.7" color={face>=club.sliceFrom()?'hsl(20, 60%, 30%)':'hsl(0, 0%, 35%)'} />
                                    <div class="overlay"><Dice value={0} filled={true} size="35" stroke="1.7" /></div>
                                </div>
                            </div>
                        {/each}
                        <div class="reroll">
                            <span>Reroll +1</span>
                        </div>
                    </div>
                </div>
            </button>
            </div>
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
        grid-gap: 5px 10px;

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
                button {
                    transform: translateX(15px);
                    filter: brightness(100%);
                }
            }
            &.disabled {
                button {
                    filter: contrast(50%) brightness(60%);
                    transition: transform 0.15s ease, filter 0.15s ease;
                }
                > .key-hint {
                    opacity: 0.08;
                }
            }
            &:not(.disabled) {
                button {
                    cursor: pointer;
                    &:hover {
                        opacity: 1;
                    }
                }
            }
            &:not(.disabled):not(.selected) {
                button:hover {
                    &:not(.out-of-shots) {
                        transform: translateX(8px);
                        transition: transform 0.7s cubic-bezier(.02,1.5,.1,1);
                    }
                    .details > .dice-faces > .reroll > span {
                        background: hsl(0, 0%, 55%, 85%);
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
            .reroll-spinner {
                grid-column: start / end;
                display: grid;
                grid-template-columns: subgrid;
            }
            button {
                grid-column: start / end;
                display: grid;
                grid-template-columns: subgrid;
                background: hsl(0, 0%, 75%);
                color: hsl(0, 0%, 5%);
                padding: 0 6px;
                border-radius: 4px;
                transition: transform 0.3s ease, filter 0.3s ease;
                transform: translateX(0);
                border: none;
                filter: brightness(80%);

                &:not(.out-of-shots) {
                    .details > .dice-faces > .reroll {
                        display: none;
                    }
                }

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

                    > .terrain {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: center;
                        gap: 1px;
                        margin: 0;
                        padding: 0;
                        list-style: none;

                        > li {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 2px 1px;
                        }
                    }

                    > .dice-faces {
                        display: flex;
                        flex-flow: row-reverse nowrap;
                        align-items: stretch;
                        justify-content: center;
                        gap: 1px;
                        position: relative;

                        > .reroll {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            justify-content: center;
                            padding: 0 4px;
                            > span {
                                flex: 1 1 auto;
                                padding: 0 6px;
                                border-radius: 3px;
                                color: hsl(0, 0%, 20%);
                                background: hsl(0, 0%, 65%, 60%);
                                font-size: 20px;
                                font-weight: bold;
                                transition: background-color 0.25s ease;
                            }
                        }

                        > .dice-face {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            padding: 2px 1px;
                            position: relative;
                            overflow-y: clip;

                            &.used {
                                filter: opacity(0.4) contrast(0.5);
                            }
                            &.next {
                                margin-top: -1px;
                                background: hsl(0, 0%, 100%);
                                &::after {
                                    position: absolute;
                                    top: -10px;
                                    bottom: -10px;
                                    left: 0;
                                    right: 0;
                                    box-shadow: -1px 0 5px hsl(0, 0%, 0%, 20%);
                                    content: '';
                                }
                            }
                            &.unused {
                                filter: opacity(0.85);
                            }

                            > .dice-wrapper {
                                isolation: isolate;
                                position: relative;
                                overflow: hidden;
                                line-height: 0;

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