import * as Mousetrap from "mousetrap";
import { Log, Notifications } from "../Managers";

export class DebuggingClass {
    context: any = {};

    initialize(context?: any) {
        this.context = {
            ...this.context,
            ...context,
        };

        Mousetrap.bind("ctrl+shift+enter", async () => {
            Log.warn("Opening debug menu!");

            const notification = Notifications.fullscreenNotification({
                allowEnterKey: false,
                input: "text",
                title: "Enter a command: ",
            }, true);

            const input = await notification.result;
            if (input.dismiss) { return; }

            Log.info("Entered debug command: " + input.value);
            let output: any | undefined;

            try {
                output = eval.call(this.context, `(${input.value})`);
            } catch (e) {
                output = (e as Error).message;
            }

            Notifications.closeFullscreenNotification(notification.id);
            Notifications.fullscreenNotification({
                text: typeof(output) === "string" ? output : JSON.stringify(output),
                title: "Return value: ",
            });
        });
    }
}

const debugging = new DebuggingClass();

debugging.context.jasu =
debugging.context.crash = () => {
    window.onerror(
        "Manual Crash",
        undefined,
        undefined,
        undefined,
        new Error("DebugCommandManualCrash()"));
};

export let Debugging = debugging;
