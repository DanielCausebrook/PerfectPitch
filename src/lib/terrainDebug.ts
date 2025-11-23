import type {Region2D, Tiling2D} from "$lib/maths/tiling2D";

export class TerrainDebugSetting<T> {
    id: string;
    name: string;
    value: T;

    constructor(id: string, name: string, defaultValue: T) {
        this.id = id;
        this.name = name;
        this.value = defaultValue;
    }
}

export class TerrainDebugRadioGroup extends TerrainDebugSetting<string> {
    options: {id: string, name: string}[];

    constructor(id: string, name: string, defaultOptionId: string, defaultOptionName: string) {
        super(id, name, defaultOptionId);
        this.options = [{id: defaultOptionId, name: defaultOptionName}];
    }

    addOption(id: string, name: string) {
        this.options.push({id: id, name: name});
        return this;
    }
}

export class TerrainDebugBool extends TerrainDebugSetting<boolean> {
    constructor(id: string, name: string, defaultValue: boolean) {
        super(id, name, defaultValue);
    }
}

export class TerrainDebugNumber extends TerrainDebugSetting<number> {
    sliderMin: number;
    sliderMax: number;
    sliderStep: number;

    constructor(id: string, name: string, sliderMin: number, sliderMax: number, sliderStep: number, defaultValue: number) {
        super(id, name, defaultValue);
        this.sliderMin = sliderMin;
        this.sliderMax = sliderMax;
        this.sliderStep = sliderStep;
    }
}

export class TerrainDebugSettings {
    settings: TerrainDebugSetting<any>[] = [];

    addSetting(setting: TerrainDebugSetting<any>) {
        this.settings.push(setting);
        return this;
    }

    setting(id: string) {
        return this.settings.find(setting => setting.id === id) ?? null;
    }

    is(settingId: string, value: any): boolean {
        return this.setting(settingId)?.value === value;
    }

    get(settingId: string): any|null {
        return this.setting(settingId)?.value ?? null;
    }
}

export class DebugMap<R extends Region2D> {
    map: Tiling2D<R, number | boolean>;
    value: number|null = null;

    constructor(map: Tiling2D<R, number | boolean>) {
        this.map = map;
    }

    withValue(value: number): this {
        this.value = value;
        return this;
    }
}

export function createTerrainDebugSettings() {
    return new TerrainDebugSettings()
        .addSetting(new TerrainDebugRadioGroup('generator', 'Generator', 'hex', 'Hex')
            .addOption('rect', 'Rect')
            .addOption('old', 'Old (Rect)')
        )
        .addSetting(new TerrainDebugRadioGroup('map', 'Map', 'result', 'Result')
            .addOption('edge', "Edge")
            .addOption('walls', "Walls")
            .addOption('path', 'Path')
            .addOption('pathEnds', 'Path Ends')
            .addOption('l', 'Land')
            .addOption('w', 'Water')
            .addOption('r', 'Rock')
            .addOption('f', 'Fairway')
            .addOption('t', 'Trees')
            .addOption('s', 'Sand')
            .addOption('noise', 'Noise')
            .addOption('par', 'Par Calc')
        )
        .addSetting(new TerrainDebugNumber('parSample', 'Par Sample', 0, 9, 1, 0))
        .addSetting(new TerrainDebugNumber('a', 'A', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugNumber('b', 'B', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugNumber('c', 'C', -1, 1, 0.05, 0))
        .addSetting(new TerrainDebugBool('m', 'M', false))
        .addSetting(new TerrainDebugBool('n', 'N', false))
        ;
}
