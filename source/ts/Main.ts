import swal from 'sweetalert2';
import * as $ from 'jquery';
window.onerror = function (_, __, ___, ____, error) {
    let crashId = uuidv4();

    error = error || new Error("No error object received.");

    //TODO: Handle this serverside somewhere
    Log.error("Uncaught Exception: ", error);

    Notifications.fullscreenNotification({
        type: "error",
        title: "An unhandled error has occured and VoliBot's UI crashed! :(",
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
        width: 'auto',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: false,
        showCloseButton: false,
        showConfirmButton: true,
        confirmButtonText: "Reload VoliBot-UI",        
        onClose: () => {
            window.location.reload();
        }
    }, true);

    let crashData = {
        crashId: crashId,
        logs: Log.toJson(),
        userAgent: navigator.userAgent
    }

    console.warn("Error info: ");
    console.warn(crashData);

    //TODO: Add loading commands to Notifications, no other script should access swal.
    swal.showLoading();
    $.post("/", crashData)
    .fail(() => swal.showValidationError("Could not automatically report the error.<br>Please follow the steps above if this happens more than once!"))
    .always(() => swal.hideLoading());
    
    var suppressErrorAlert = false;
    // If you return true, then error alerts (like in older versions of Internet Explorer) will be suppressed.
    return suppressErrorAlert;

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

import { Log, UI, Notifications, Settings, Accounts, VoliBotManager, News } from './Managers';
import { ScreenLogin } from './UI/Screens/Login';
import { ScreenMain } from './UI/Screens/Main';

UI.registerScreen("Login", new ScreenLogin());
UI.registerScreen("Main", new ScreenMain());

Log.initialize();
Settings.initialize();
Notifications.initialize();
News.initialize();
Accounts.initialize();
VoliBotManager.initialize();
UI.initialize();

import { Debugging } from './Debugging';

Debugging.initialize({
    Log: Log,
    Settings: Settings,
    Notifications: Notifications,
    News: News,
    Accounts: Accounts,
    VoliBotManager: VoliBotManager,
    UI: UI,
});