<script>import {defaultAttributes} from '@tabler/icons-svelte';
export let type;
export let name;
export let color = 'currentColor';
export let size = 24;
export let stroke = 2;
export let iconNode;
</script>

<svg
  {...defaultAttributes[type]}
  {...$$restProps}
  width={size}
  height={size}
  class={`tabler-icon tabler-icon-${name} ${$$props.class ?? ''}`}
  {...type === 'filled'
    ? {
        fill: color,
      }
    : {
        'stroke-width': stroke,
        stroke: color,
      }}
>
  {#each iconNode as [tag, attrs]}
    <svelte:element this={tag} {...attrs} />
  {/each}
  <slot />
</svg>
