import { IUi } from "../";

export abstract class ComponentBase implements IUi {
    abstract hookUi(): void;
}
