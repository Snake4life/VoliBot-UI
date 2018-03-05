//NOTE:
// This file will throw two errors related to iziToast.
// Ignore them, it's the typings for it that's wrong, iziToast is used correctly here.

//TODO: Fix iziToast typings?

import * as $ from "jquery";
import { Settings } from "./";
import { Log } from "./LogManager";
import { Manager } from "./Manager";

import swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
export { SweetAlertOptions as FullscreenNotification } from "sweetalert2";

import iziToast = require("izitoast");

export class NotificationsManager extends Manager {
    private _currentFullscreenId: number | undefined = undefined;

    initialize() {
        Settings.registerSetting("global_DefaultNotificationTimeout", 1500);
    }

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
            const id = Math.floor(Math.random() * 1000);
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
        timeout: number | boolean,
        onClick?: () => void,
        iconClasses?: string) {
        const toastId: string | undefined = `toast_${notificationId || Math.floor(Math.random() * 10000) }`;

        if (notificationId != null) {
            if (/[^a-z^A-Z]/.test(notificationId)) {
                Log.error(`Invalid notificationId ([a-zA-Z] allowed): ${notificationId}`);
                return;
            }

            const oldNotification = document.getElementById(toastId);
            if (oldNotification) {
                // tslint:disable-next-line:max-line-length
                Log.debug(`Notification with notificationId '${notificationId}' already exists, closing it before opening a new notification.`);
                this.closeNotification(notificationId, displayNotification.bind(this));
            } else {
                displayNotification.call(this);
            }
        } else {
            displayNotification.call(this);
        }

        function displayNotification() {
            message = message.replace(/\n/g, "<br>");
            if (typeof timeout === "boolean") {
                timeout = timeout ? Settings.getNumber("global_DefaultNotificationTimeout") : false;
            }

            iziToast.show({
                icon: iconClasses,
                id: toastId,
                layout: 2,
                message: `<strong>${title}</strong><br>${message}`,
                theme: "dark",
                timeout,
            });

            if (onClick) {
                $(`#${toastId} > .iziToast-body`).on("click", onClick).css("cursor", "pointer");
            }
        }
    }

    closeNotification(notificationId: string, onClosed?: () => void) {
        const notifications = document.querySelectorAll(`#toast_${notificationId}`);

        notifications.forEach((notification) => {
            $(notification).off("click");
            if (notification instanceof HTMLDivElement) {
                iziToast.hide(notification, {
                    message: "",
                    onClosed,
                    transitionOut: "fadeOutRight",
                }, "closeNotification");
            } else {
                Log.warn(`Tried to close non-existant notification with notificationId: ${notificationId}`);
            }
        }, this);
    }
}

export const Notifications = new NotificationsManager();
