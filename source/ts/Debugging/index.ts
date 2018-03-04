import Mousetrap = require("mousetrap");
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
                // I have to disable rules here to make it work, at least as far as I know.
                // If there's a better way, feel free to change to using that instead.
                // tslint:disable-next-line:only-arrow-functions
                output = (function(str: string) {
                    // tslint:disable-next-line:no-eval
                    return eval(str);
                }).call(this.context, `(${input.value})`);
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
