import { IManager } from "./IManager";
import swal, { SweetAlertOptions } from 'sweetalert2';

export { SweetAlertOptions as FullscreenNotification } from 'sweetalert2';

export class NotificationsManager implements IManager {
    initialize(): void { }
    private currentFullscreenId: number | undefined = undefined;

    closeFullscreenNotification(id: number) {
        if (id != this.currentFullscreenId)
            console.error("Invalid ID for closeFullscreenNotification!");
        else
            swal.close();
    }

    fullscreenNotification(options: SweetAlertOptions, forceDisplay: boolean = false): number {
        if (!swal.isVisible() || forceDisplay) {
            swal(options);
            let id = Math.floor(Math.random() * Math.floor(1000));
            this.currentFullscreenId = id;
            return id;
        }
        else
            throw `Fullscreen notification is already being shown!`;
    }

    addNotification(title: string, message: string): number {
        title;
        message;
        throw new Error("Method not implemented.");
    }

    removeNotification(id: number) {
        id;
        throw new Error("Method not implemented.");
    }
}

export var Notifications = new NotificationsManager();