<script>import Icon from './Icon.svelte';
const iconNode = [["path", { "d": "M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" }]];
</script>
<Icon type="outline" name="dice-1" {...$$props} iconNode={iconNode}>
  <slot/>
</Icon>
