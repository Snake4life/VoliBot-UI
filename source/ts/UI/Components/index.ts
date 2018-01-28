import { IUi } from '../';

export abstract class UiComponentBase implements IUi {
    abstract hookUi(): void;
}