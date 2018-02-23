import { IUi } from "../";
import { ComponentBase } from "../Components";

export abstract class ScreenBase implements IUi {
    abstract rootElement: HTMLElement;
    abstract hookUi(): void;
    abstract registerComponents(registerFunction: (component: ComponentBase) => number): void;
}
