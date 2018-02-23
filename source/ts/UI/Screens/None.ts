import { ScreenBase } from "../Screens";

export class ScreenNone extends ScreenBase {

    rootElement: HTMLElement;

    constructor() {
        super();
        this.rootElement = document.createElement("null");
    }

    hookUi() {/**/}
    registerComponents() {/**/}
}
