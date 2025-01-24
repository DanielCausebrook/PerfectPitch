<script lang="ts">
    import {
        IconArrowBigRight,
        IconChevronCompactDown, IconCone,
        IconDiamonds, IconPoint,
    } from "@tabler/icons-svelte";
    import {getClubData, ClubType} from "./player";
    import type {CellType} from "./course";

    export let hoveredClub: ClubType|null = null;

    let currentRequest: {
        cellType: CellType,
        result: ClubType|null,
        promiseResolve: (value: ClubType) => void,
        promiseReject: (reason?: any) => void,
        onSelect: (clubType: ClubType) => void,
    }|null = null;

    export const request: (cellType: CellType, onSelect: (clubType: ClubType) => void) => Promise<ClubType> = (cellType, onSelect) => {
        return new Promise((resolve, reject) => {
            currentRequest = {
                cellType: cellType,
                result: null,
                promiseResolve: resolve,
                promiseReject: reject,
                onSelect: onSelect,
            };
        });
    }
    export const cancel: () => void = () => {
        if (currentRequest === null) {
            return;
        }
        currentRequest.promiseReject();
        currentRequest = null;
    };

    const putterData = getClubData(ClubType.Putter);
    const ironData = getClubData(ClubType.Iron);
    const driverData = getClubData(ClubType.Driver);
    const wedgeData = getClubData(ClubType.Wedge);

    function select(clubType: ClubType) {
        if (currentRequest === null) {
            return;
        }
        currentRequest.result = clubType;
        currentRequest.promiseResolve(clubType);
        currentRequest.onSelect(clubType);
    }
</script>
<section class="clubs">
    <button
            class="putter"
            onclick={() => select(ClubType.Putter)}
            onmouseover={() => { hoveredClub = ClubType.Putter;  }}
            onmouseleave={() => { hoveredClub = null; }}
            class:selected={currentRequest !== null && currentRequest.result === ClubType.Putter}
            disabled={currentRequest === null || !putterData.canUseOn(currentRequest.cellType)}
    >
        <IconPoint stroke="3" size="28"/>
        Putter
        <span class="selection-marker"><IconChevronCompactDown size="56" color="hsl(180, 80%, 80%)" /></span>
    </button>
    <button
            class="wedge"
            onclick={() => select(ClubType.Wedge)}
            onmouseover={() => { hoveredClub = ClubType.Wedge; }}
            onmouseleave={() => { hoveredClub = null; }}
            class:selected={currentRequest !== null && currentRequest.result === ClubType.Wedge}
            disabled={currentRequest === null || !wedgeData.canUseOn(currentRequest.cellType)}
    >
        <IconCone stroke="3" size="28" />
        Wedge
        <span class="selection-marker"><IconChevronCompactDown size="56" color="hsl(180, 80%, 80%)" /></span>
    </button>
    <button
            class="iron"
            onclick={() => select(ClubType.Iron)}
            onmouseover={() => { hoveredClub = ClubType.Iron; }}
            onmouseleave={() => { hoveredClub = null; }}
            class:selected={currentRequest !== null && currentRequest.result === ClubType.Iron}
            disabled={currentRequest === null || !ironData.canUseOn(currentRequest.cellType)}
    >
        <IconDiamonds stroke="3" size="28" />
        Iron
        <span class="selection-marker"><IconChevronCompactDown size="56" color="hsl(180, 80%, 80%)" /></span>
    </button>
    <button
            class="driver"
            onclick={() => select(ClubType.Driver)}
            onmouseover={() => { hoveredClub = ClubType.Driver; }}
            onmouseleave={() => { hoveredClub = null; }}
            class:selected={currentRequest !== null && currentRequest.result === ClubType.Driver}
            disabled={currentRequest === null || !driverData.canUseOn(currentRequest.cellType)}
    >
        <IconArrowBigRight stroke="3" size="28" />
        Driver
        <span class="selection-marker"><IconChevronCompactDown size="56" color="hsl(180, 80%, 80%)" /></span>
    </button>
</section>
<style>
    .clubs {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        gap: 10px;
        > button {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: left;
            gap: 10px;
            position: relative;
            padding: 8px 16px;
            background: hsl(240, 60%, 55%);
            border-radius: 5px;

            &[disabled] {
                background: hsl(0, 0%, 25%);
                cursor: default;
            }

            &.selected {
                background: hsl(220, 60%, 60%);
                > .selection-marker {
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translate(-50%, -52%);
                }
            }

            > .selection-marker {
                display: none;
            }
        }
    }
</style>