import * as $ from "jquery";
import swal from "sweetalert2";

window.onerror = (_, __, ___, ____, error) => {
    //TODO: IMPORTANT! Remove user passwords from logs before sending them!
    //TODO: Handle this serverside somewhere
    const crashId = uuidv4();

    error = error || new Error("No error object received.");
    Log.error("Uncaught Exception: ", error);

    Notifications.fullscreenNotification({
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: "Reload VoliBot-UI",
        // tslint:disable:max-line-length
        html:
            "If reloading the browser window does not solve the issue, or you want to add additional info to the report:" + "<br>" +
            "<br>" +
            '<div style="text-align: left">' +
                "<ol>" +
                    "<li>" + "<a href='https://discord.gg/UC5nCsK'>Join our Discord</a>." + "</li>" +
                    "<li>" +
                        "Copy the message below, add a short description, and send it in the <code>#crash-report</code> channel."                                  + "<br>" +
                        "<pre>" +
                            "```md"                                                                                                                                + "<br>" +
                            "Crash Report for: VoliBot-UI"                                                                                                         + "<br>" +
                            "============================"                                                                                                         + "<br>" +
                            ""                                                                                                                                     + "<br>" +
                            "# Crash ID:"                                                                                                                          + "<br>" +
                            crashId                                                                                                                                + "<br>" +
                            ""                                                                                                                                     + "<br>" +
                            "# What I suspect caused the crash:"                                                                                                   + "<br>" +
                            "Replace this text with a short description if you want to make it easier for us to find the error, or delete it if you have no idea." + "<br>" +
                            ""                                                                                                                                     + "<br>" +
                            "```"                                                                                                                                  + "<br>" +
                        "</pre>" +
                    "</li>" +
                    "<li><span>" + "If the crash prevents you from using VoliBot, send a second message containing <code>@SupportRequest </code>&nbsp and nothing more.</span>" + "</li>" +
                    "<li>"       + "Feel free to ask our other users in the <code>#support</code> channel if any of them has a temporary solution, most of them are helpful :)" + "</li>" +
                    "<li>"       + "Wait for one of our staff to notice the report."                                                                                            + "</li>" +
                "</ol>" +
            "</div>",
        // tslint:enable:max-line-length
        onClose: () => {
            window.location.reload();
        },
        showCancelButton: false,
        showCloseButton: false,
        showConfirmButton: true,
        title: "An unhandled error has occured and VoliBot's UI crashed! :(",
        type: "error",
        width: "auto",
    }, true);

    const crashData = {
        crashId,
        logs: Log.toJson(),
        userAgent: navigator.userAgent,
    };

    // tslint:disable-next-line:no-console
    console.warn("Error info: ");

    // tslint:disable-next-line:no-console
    console.warn(crashData);

    //TODO: Add loading commands to Notifications, no other script should access swal.
    swal.showLoading();
    $.post("/", crashData)
    // tslint:disable-next-line:max-line-length
    .fail(() => swal.showValidationError("Could not automatically report the error.<br>Please follow the steps above if this happens more than once!"))
    .always(() => swal.hideLoading());

    const suppressErrorAlert = false;
    // If you return true, then error alerts (like in older versions of Internet Explorer) will be suppressed.
    return suppressErrorAlert;

    function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            // tslint:disable-next-line:no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line:no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

import { Accounts, Log, News, Notifications, Settings, UI, VoliBotManager } from "./Managers";
import { ScreenLogin } from "./UI/Screens/Login";
import { ScreenMain } from "./UI/Screens/Main";
import { ScreenNone } from "./UI/Screens/None";

UI.registerScreen("Login", new ScreenLogin());
UI.registerScreen("Main", new ScreenMain());
UI.registerScreen("None", new ScreenNone());

const context = {
    Accounts,
    Log,
    News,
    Notifications,
    Settings,
    UI,
    VoliBotManager,
};

import { Debugging } from "./Debugging";
(window as any).voli = context;
Debugging.initialize(context);
Log.initialize();
Settings.initialize();
Notifications.initialize();
UI.initialize();
News.initialize();
Accounts.initialize();
VoliBotManager.initialize();