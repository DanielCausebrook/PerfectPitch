<script>import Icon from './Icon.svelte';
const iconNode = [["path", { "d": "M18.333 2c1.96 0 3.56 1.537 3.662 3.472l.005 .195v12.666c0 1.96 -1.537 3.56 -3.472 3.662l-.195 .005h-12.666a3.667 3.667 0 0 1 -3.662 -3.472l-.005 -.195v-12.666c0 -1.96 1.537 -3.56 3.472 -3.662l.195 -.005h12.666z" }]];
</script>
<Icon type="filled" name="dice-0-filled" {...$$props} iconNode={iconNode}>
  <slot/>
</Icon>
