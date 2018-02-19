import { Log } from './LogManager';
import { IManager } from "./IManager";
import swal, { SweetAlertOptions } from 'sweetalert2';
import iziToast from 'izitoast';

export { SweetAlertOptions as FullscreenNotification } from 'sweetalert2';

export class NotificationsManager implements IManager {
    initialize(): void { }
    private _currentFullscreenId: number | undefined = undefined;

    private get currentFullscreenId() {
        return this._currentFullscreenId;
    }

    private set currentFullscreenId(id: number | undefined) {
        Log.debug("Set current Fullscreen ID: " + id);
        this._currentFullscreenId = id;
    }

    closeFullscreenNotification(id: number): boolean {
        Log.debug("Attempting to close Fullscreen ID: " + id);

        if (id != this.currentFullscreenId) {
            Log.error("Invalid ID for closeFullscreenNotification!");
            return false;
        } else {
            this.currentFullscreenId = undefined;
            swal.close();
            return true;
        }
    }

    fullscreenNotification(options: SweetAlertOptions, forceDisplay: boolean = false): number {
        if (!this.currentFullscreenId || forceDisplay) {
            let close = options.onClose;
            options.onClose = x => {
                close && close(x);
                this.currentFullscreenId = undefined;
            }

            swal(options);
            let id = Math.floor(Math.random() * Math.floor(1000));
            this.currentFullscreenId = id;
            return id;
        }
        else
            throw new Error("Fullscreen notification is already being shown!");
    }

    addNotification(notificationId: string | null, title: string, message: string, timeout?: number, onClick?: () => void, iconClasses?: string) {
        if (notificationId != null){
            if (!/[^a-zA-Z]/.test(notificationId)) {
                Log.error(`Invalid notificationId ([a-zA-Z] allowed): ${notificationId}`)
                return;
            }
            notificationId = `toast_${notificationId}`;
    
            let oldNotification = $(`#${notificationId}`);
            if (oldNotification) {
                Log.info(`Notification with notificationId '${notificationId}' already exists, closing it before opening a new notification.`);
                this.closeNotification(notificationId, displayNotification);
            }else{
                displayNotification();
            }
        }

        function displayNotification(){
            iziToast.show({
                id: "notificationId",
                layout: 2,
                message: `<strong>${title}</strong><br>${message}`,
                theme: 'dark',
                timeout: timeout || false,
                icon: iconClasses
            });
    
            if (onClick)
                $(`#toast_${notificationId} > .iziToast-body`).on('click', onClick);
        }
    }

    closeNotification(notificationId: string, onClosed?: () => void){
        let notification = document.querySelector(`#toast_${notificationId}`);

        if (notification instanceof HTMLDivElement)
            iziToast.hide({message: "", transitionOut: 'fadeOutRight', onClosed: onClosed}, notification, "closeNotification");
        else
            Log.warn(`Tried to close non-existant notification with notificationId: ${notificationId}`);
    }
}

export var Notifications = new NotificationsManager();