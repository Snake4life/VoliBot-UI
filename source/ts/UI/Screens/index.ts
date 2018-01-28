import { IUi } from '../';
import { UiComponentBase } from '../Components';

export abstract class ScreenBase implements IUi {
    abstract rootElement: HTMLElement;
    abstract hookUi(): void;
    abstract registerComponents(registerFunction: (component: UiComponentBase) => number): void;
}