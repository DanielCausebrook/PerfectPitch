<script lang="ts">
    import {ClubData, type ClubType, getClubData} from "./player";
    import Dice from "./Dice.svelte";
    import Cell from "./Cell.svelte";
    import {IconBounceRightFilled, IconPlaneTilt} from "@tabler/icons-svelte";

    export let clubType: ClubType;
    let clubData: ClubData = getClubData(clubType);
</script>
<article>
    <ul class="dice-faces">
        {#each clubData.diceFaces() as face}
            <li><Dice value={face} filled={false} size="26" stroke="2" color={face < 5 ? 'white' : 'hsl(20, 80%, 75%)'}></Dice></li>
        {/each}
    </ul>
    <ul class="terrain">
        {#each clubData.cellTypes() as cellType}
            <li><Cell cellType={cellType} size={22} borderRadius={6} /></li>
        {/each}
        {#if clubData.allowsRolls()}
            <li><IconBounceRightFilled size={22} /></li>
        {/if}
        {#if clubData.noStick()}
            <li><IconPlaneTilt size={22} /></li>
        {/if}
    </ul>

</article>
<style>
    article {
        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;
        justify-content: center;
        padding: 0 10px;

        > ul {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            gap: 3px;
            padding: 2px 0;
            > li {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
            }
        }
        > .dice-faces {
            border-bottom: 1px solid white;
        }
        > .terrain {
        }
    }
    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
</style>