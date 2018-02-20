import { Log, Notifications } from '../Managers';
import * as Mousetrap from 'mousetrap';

export class DebuggingClass {
    context: any = {};

    initialize(context?: any){
        this.context = {
            ...this.context,
            ...context,
        }

        Mousetrap.bind('ctrl+shift+enter', async () => {
            Log.warn("Opening debug menu!");

            let notification = Notifications.fullscreenNotification({
                title: "Enter a command: ",
                allowEnterKey: false,
                input: "text",
            }, true);

            let input = await notification.result;
            if (input.dismiss) return;

            Log.info("Entered debug command: " + input.value);
            let output: any | undefined;

            try{
                output = eval.call(this.context, `(${input.value})`);
            }catch(e){
                output = (e as Error).message;
            }

            Notifications.closeFullscreenNotification(notification.id);
            Notifications.fullscreenNotification({
                title: "Return value: ",
                text: typeof(output) == "string" ? output : JSON.stringify(output)
            })
        });
    }
}

let debugging = new DebuggingClass();

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