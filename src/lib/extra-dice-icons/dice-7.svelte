<script>
import Icon from "./Icon.svelte";

const iconNode = [["path", { "d": "M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" }], ["circle", { "cx": "7.5", "cy": "7.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "16.5", "cy": "7.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "7.5", "cy": "12", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "12", "cy": "12", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "16.5", "cy": "12", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "16.5", "cy": "16.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "7.5", "cy": "16.5", "r": ".5", "fill": "currentColor" }]];
</script>
<Icon type="outline" name="dice-7" {...$$props} iconNode={iconNode}>
  <slot/>
</Icon>
