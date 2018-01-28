import { IManager } from "./IManager";

export class SettingsManager implements IManager {
    private settings: { [id: string]: Setting } = {};

    initialize(): void {
        this.loadSettings();
    }

    registerSetting(id: string, defaultValue: string | number | boolean) {
        if (this.settings[id] != undefined)
            throw `Can not register duplicate setting: ${id}!`;

        this.settings[id] = new Setting(defaultValue);
    }

    private loadSettings(): void {
        let rawSettings = window.localStorage.getItem("settings");
        if (rawSettings == null)
            return;

        let settings = JSON.parse(rawSettings) as { [id: string]: Setting };

        Object.keys(settings).forEach((id) => {
            if (this.settings[id] == undefined)
                console.error(`Ignoring saved setting ${id} as it is not registered!`)
            
            let savedType = settings[id].type;
            let registeredType = this.settings[id].type;

            if (savedType != registeredType)
                console.error(`Saved setting ${id} is of type ${savedType} but is registered as type ${registeredType}, ignoring saved value!`)
            else
                this.settings[id].value = settings[id].value;
        });
    }

    saveSettings() {
        window.localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    private get(id: string): Setting {
        var value = this.settings[id];

        if (value == undefined)
            throw `Setting does not exist: ${id}!`;

        return value;
    }

    getBoolean(id: string): boolean {
        let value = this.get(id);

        if (value.type != 'boolean')
            throw `Setting is not a boolean: ${id}`;

        return value.value == 'true';
    }

    getNumber(id: string): number {
        let value = this.get(id);
        
        if (value.type != 'number')
            throw `Setting is not a number: ${id}`;

        return Number(value.value);
    }

    getString(id: string): string {
        let value = this.get(id);
        
        if (value.type != 'string')
            throw `Setting is not a string: ${id}`;

        return value.value;
    }

    set(id: string, value: string | number | boolean) {
        let setting = this.settings[id];

        if (setting == undefined)
            throw `Setting does not exist: ${id}!`;

        if (setting.type != typeof value)
            throw `Setting ${id} has type ${setting.type} and can not be set to a value with type ${typeof value}!`;

        if (value == undefined)
            throw `'undefined' is not a valid value for setting: ${id}!`;

        this.settings[id].value = value.toString();
    }

    reset(id: string){
        this.settings[id].value = this.settings[id].default;
    }
}

export var Settings = new SettingsManager();

class Setting {
    value: string;
    type: string;
    readonly default: string;

    constructor(value: string | number | boolean) {
        this.type = typeof value;
        this.value = value.toString();
        this.default = value.toString();
    }
}