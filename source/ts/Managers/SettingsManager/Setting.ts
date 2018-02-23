export class Setting {
    value: string;
    type: string;
    readonly default: string;

    constructor(value: string | number | boolean) {
        this.type = typeof value;
        this.value = value.toString();
        this.default = value.toString();
    }
}
