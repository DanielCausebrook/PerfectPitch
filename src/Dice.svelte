<script lang="ts">
    import {
        IconDice1,
        IconDice1Filled, IconDice2,
        IconDice2Filled, IconDice3,
        IconDice3Filled, IconDice4,
        IconDice4Filled, IconDice5, IconDice5Filled, IconDice6,
        IconDice6Filled
    } from "@tabler/icons-svelte";
    import {
        IconDice0, IconDice0Filled,
        IconDice7,
        IconDice7Filled,
        IconDice8,
        IconDice8Filled,
        IconDice9,
        IconDice9Filled
    } from "$lib/extra-dice-icons";

    export let value: number|null = null;

    export let filled: boolean;

    export let color: string = 'currentColor';
    export let size: number|string = 24;
    export let stroke:  number|string = 2;
    export let cssClass: string = '';
</script>
{#if filled}
    {#if value === null || value === 0}
        <IconDice0Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 1}
        <IconDice1Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 2}
        <IconDice2Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 3}
        <IconDice3Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 4}
        <IconDice4Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 5}
        <IconDice5Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 6}
        <IconDice6Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 7}
        <IconDice7Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 8}
        <IconDice8Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 9}
        <IconDice9Filled color={color} size={size} stroke={stroke} class={cssClass}/>
    {/if}
{:else}
    {#if value === null || value === 0}
        <IconDice0 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 1}
        <IconDice1 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 2}
        <IconDice2 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 3}
        <IconDice3 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 4}
        <IconDice4 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 5}
        <IconDice5 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 6}
        <IconDice6 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 7}
        <IconDice7 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 8}
        <IconDice8 color={color} size={size} stroke={stroke} class={cssClass}/>
    {:else if value === 9}
        <IconDice9 color={color} size={size} stroke={stroke} class={cssClass}/>
    {/if}
{/if}