<script lang="ts">
    import {CellType, getCellData} from "./course";
    import {
        IconBackground,
        IconChristmasTreeFilled,
        IconGolf,
        IconGrain,
        IconInnerShadowTopLeftFilled,
        IconRipple, IconSquareFilled
    } from "@tabler/icons-svelte";

    export let cellType: CellType;
    export let hasBall: boolean = false;
    export let size: number = 20;
    export let borderRadius: number = 3;

    let cellIconSize = size - 2;
    let cellData = getCellData(cellType);

</script>
<div class="cell" style="width:{size}px; height:{size}px; background:{cellData.primaryColor}; border-radius:{borderRadius}px;">
    {#if hasBall}
        <IconInnerShadowTopLeftFilled size={cellIconSize} />
    {:else if cellType === CellType.Rough}
        <IconBackground size={cellIconSize} color="hsl(120, 60%, 20%)" />
    {:else if cellType === CellType.Tree}
        <IconChristmasTreeFilled size={cellIconSize} color="hsl(120, 60%, 10%)" />
    {:else if cellType === CellType.Rock}
        <IconSquareFilled size={cellIconSize} color="hsl(0, 0%, 35%)" stroke="3" />
    {:else if cellType === CellType.Hole}
        <IconGolf size={cellIconSize + 2} stroke="3" color="hsl(180, 80%, 70%)" />
    {:else if cellType === CellType.Water}
        <IconRipple size={cellIconSize} color="hsl(240, 40%, 40%)" />
    {:else if cellType === CellType.Sand}
        <IconGrain size={cellIconSize} color="hsl(55, 50%, 50%)"/>
    {/if}
</div>
<style>
    .cell {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>