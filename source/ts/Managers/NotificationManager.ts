//NOTE:
// This file will throw two errors related to iziToast.
// Ignore them, it's the typings for it that's wrong, iziToast is used correctly here.

//TODO: Fix iziToast typings?

import * as $ from "jquery";
import { Log } from "./LogManager";
import { Manager } from "./Manager";

import swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
export { SweetAlertOptions as FullscreenNotification } from "sweetalert2";

import * as iziToast from "izitoast";

export class NotificationsManager extends Manager {
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

        if (this.currentFullscreenId === undefined) { return true; }
        if (id !== this.currentFullscreenId) {
            Log.warn("Invalid ID for closeFullscreenNotification: " + id + " instead of " + this.currentFullscreenId);
            return false;
        } else {
            this.currentFullscreenId = undefined;
            swal.close();
            return true;
        }
    }

    fullscreenNotification(
        options: SweetAlertOptions,
        forceDisplay: boolean = false): {id: number, result: Promise<SweetAlertResult>} {
        if (!this.currentFullscreenId || forceDisplay) {
            const close = options.onClose;
            options.onClose = (x) => {
                if (close !== undefined) {
                    close(x);
                }
                this.currentFullscreenId = undefined;
            };

            const result = swal(options);
            const id = Math.floor(Math.random() * Math.floor(1000));
            this.currentFullscreenId = id;
            return { id, result };
        } else {
            throw new Error("Fullscreen notification is already being shown!");
        }
    }

    addNotification(
        notificationId: string | null,
        title: string,
        message: string,
        timeout?: number,
        onClick?: () => void,
        iconClasses?: string) {
        let toastId: string | undefined = `toast_${notificationId || "none"}`;

        if (notificationId != null) {
            if (/[^a-z^A-Z]/.test(notificationId)) {
                Log.error(`Invalid notificationId ([a-zA-Z] allowed): ${notificationId}`);
                return;
            }

            const oldNotification = document.getElementById(toastId);
            if (oldNotification) {
                // tslint:disable-next-line:max-line-length
                Log.info(`Notification with notificationId '${notificationId}' already exists, closing it before opening a new notification.`);
                this.closeNotification(notificationId, () => displayNotification.call(this));
            } else {
                displayNotification.call(this);
            }
        } else {
            toastId = undefined;
            displayNotification.call(this);
        }

        function displayNotification() {
            iziToast.show({
                icon: iconClasses,
                id: toastId,
                layout: 2,
                message: `<strong>${title}</strong><br>${message}`,
                theme: "dark",
                timeout: timeout || false,
            });

            if (onClick) {
                $(`#toast_${notificationId} > .iziToast-body`).on("click", onClick);
            }
        }
    }

    closeNotification(notificationId: string, onClosed?: () => void) {
        const notifications = document.querySelectorAll(`#toast_${notificationId}`);

        notifications.forEach((notification) => {
            if (notification instanceof HTMLDivElement) {
                // tslint:disable-next-line:max-line-length
                iziToast.hide(notification, {message: "", transitionOut: "fadeOutRight", onClosed}, "closeNotification");
            } else {
                Log.warn(`Tried to close non-existant notification with notificationId: ${notificationId}`);
            }
        }, this);
    }
}

export const Notifications = new NotificationsManager();
