<script lang="ts">
    import {CellType} from "./course";
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

    function cellTypeClass(cellType: CellType) {
        switch (cellType) {
            case CellType.Fairway: return 'cell-fairway';
            case CellType.Rough: return 'cell-rough';
            case CellType.Sand: return 'cell-sand';
            case CellType.Water: return 'cell-water';
            case CellType.Tree: return 'cell-tree';
            case CellType.Rock: return 'cell-rock';
            case CellType.Hole: return 'cell-hole';
        }
    }
</script>
<div class={['cell', cellTypeClass(cellType)]} style="width:{size}px; height:{size}px; border-radius:{borderRadius}px;">
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

        &.cell-fairway {
            background: hsl(90, 60%, 40%);
        }
        &.cell-hole {
            background: hsl(170, 60%, 45%);
        }
        &.cell-rough {
            background: hsl(100, 60%, 35%);
        }
        &.cell-tree {
            background: hsl(120, 20%, 35%);
        }
        &.cell-rock {
            background: hsl(120, 0%, 30%);
        }
        &.cell-sand {
            background: hsl(55, 50%, 60%);
        }
        &.cell-water {
            background: hsl(240, 40%, 60%);
        }
    }
</style>