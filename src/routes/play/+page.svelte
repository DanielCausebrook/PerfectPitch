<script lang="ts">
    import {browser} from "$app/environment";
    import { page } from '$app/state';
    import App from "../../App.svelte";
    import {seedFromSeedId} from "../../seed";

    let now = new Date();
    let urlSeedId: string|null = browser ? page.url.searchParams.get('seed') : null;
    let seed: number = urlSeedId === null
        ? now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate()
        : seedFromSeedId(urlSeedId);
</script>
<App seed={seed} />