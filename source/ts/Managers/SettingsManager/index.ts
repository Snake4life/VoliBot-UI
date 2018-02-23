import { Log } from "../";
import { Manager } from "../Manager";
import { Setting } from "./Setting";

export class SettingsManager extends Manager {
    private settings: { [id: string]: Setting } = {};

    initialize(): void {
        this.loadSettings();
    }

    registerSetting(id: string, defaultValue: string | number | boolean) {
        Log.debug(`Registering setting "${id}" as "${typeof defaultValue}" with default value: ${defaultValue}`);
        if (this.settings[id] !== undefined) {
            Log.error(`Can not register duplicate setting: ${id}!`);
        }

        this.settings[id] = new Setting(defaultValue);
    }

    saveSettings() {
        window.localStorage.setItem("settings", JSON.stringify(this.settings));
    }

    getBoolean(id: string): boolean {
        const value = this.get(id);

        if (value.type !== "boolean") {
            throw new Error(`Setting is not a boolean: ${id}`);
        }

        return value.value === "true";
    }

    getNumber(id: string): number {
        const value = this.get(id);

        if (value.type !== "number") {
            throw new Error(`Setting is not a number: ${id}`);
        }

        return Number(value.value);
    }

    getString(id: string): string {
        const value = this.get(id);

        if (value.type !== "string") {
            throw new Error(`Setting is not a string: ${id}`);
        }

        return value.value;
    }

    set(id: string, value: string | number | boolean, save: boolean = true) {
        const setting = this.settings[id];

        if (setting === undefined) {
            throw new Error(`Setting does not exist: ${id}!`);
        }

        if (setting.type !== typeof value) {
            // tslint:disable-next-line:max-line-length
            throw new Error(`Setting "${id}" has type "${setting.type}" and can not be set to a value with type "${typeof value}"!`);
        }

        if (value === undefined) {
            throw new Error(`'undefined' is not a valid value for setting: ${id}!`);
        }

        Log.debug(`Set value of setting "${id}" to: ${value}`);
        this.settings[id].value = value.toString();

        if (save) {
            this.saveSettings();
        }
    }

    reset(id: string) {
        this.settings[id].value = this.settings[id].default;
    }

    private loadSettings(): void {
        Log.info("Loading all settings");
        const rawSettings = window.localStorage.getItem("settings");
        if (rawSettings == null) {
            Log.info("First time VoliBot UI is launched on this device, or settings has been wiped.");
            return;
        }

        const settings = JSON.parse(rawSettings) as { [id: string]: Setting };

        Object.keys(settings).forEach((id) => {
            if (this.settings[id] === undefined) {
                Log.warn(`Ignoring saved setting "${id}" as it is not registered!`);
                return;
            }
            const savedType = settings[id].type;
            const registeredType = this.settings[id].type;

            if (savedType !== registeredType) {
                // tslint:disable-next-line:max-line-length
                Log.warn(`Saved setting "${id}" is of type "${savedType}" but is registered as type "${registeredType}", ignoring saved value!`);
            } else {
                this.settings[id].value = settings[id].value;
            }

            Log.debug(`Loaded saved value for setting "${id}": ${this.settings[id].value}`);
        });
    }

    private get(id: string): Setting {
        const value = this.settings[id];

        if (value === undefined) {
            throw new Error(`Setting does not exist: ${id}!`);
        }

        return value;
    }
}

export const Settings = new SettingsManager();
