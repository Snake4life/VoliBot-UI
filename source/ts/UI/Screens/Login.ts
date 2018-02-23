import * as anime from "animejs";
import * as $ from "jquery";
import swal from "sweetalert2";

import HostData from "../../Models/HostData";

import { Settings, UI, VoliBotManager } from "../../Managers";
import { Log } from "../../Managers/LogManager";
import { Notifications } from "../../Managers/NotificationManager";
import { ScreenBase } from "./";

export class ScreenLogin extends ScreenBase {
    rootElement: HTMLElement;
    showGoodbye: boolean = true;
    pageUnloading: boolean = false;
    connected: boolean = false;

    constructor() {
        super();

        const loginView = document.getElementById("LoginView");

        if (loginView != null) {
            this.rootElement = loginView;
        } else {
            throw new Error("Could not get element: #LoginView");
        }

        Settings.registerSetting("login__hostname", "localhost");
        Settings.registerSetting("login__automatically", false);
    }

    registerComponents(): void {
        //
    }

    hookUi() {
        $(".login__form").submit(() => this.doLogin());
        $("#login__hostname").val(Settings.getString("login__hostname"));

        $("#login__remember").prop("checked", Settings.getString("login__hostname"));
        $("#login__remember").change(() => {
            if (!$("#login__remember").is(":checked")) {
                Settings.reset("login__hostname");
            }
        });

        $("#login__automatically").prop("checked", Settings.getBoolean("login__automatically"));
        $("#login__automatically").change(
            () => Settings.set("login__automatically",
            $("#login__automatically").is(":checked"),
        ));

        if (Settings.getBoolean("login__automatically")) {
            this.doLogin();
        } else {
            UI.setCurrentScreen(this).add({
                delay: (_, i) => i * 150,
                duration: 500,
                easing: "easeInOutSine",
                offset: "-=100",
                strokeDashoffset: [anime.setDashoffset, 0],
                targets: ".volibot-logo>svg>g>path",
            }).add({
                duration: 750,
                easing: "linear",
                fillOpacity: 1,
                offset: "+=350",
                targets: ".volibot-logo>svg>g",
            });
        }
    }

    parseHost(host: string, fallbackPort: number): HostData {
        const isipv6 = !!host.match(/\[.*\]|(?:.*:){2,}/);
        const needsBrackets = !host.match(/\[.*\]/) && isipv6;
        const addedPort = [undefined, needsBrackets ? "[" + host + "]" : host, fallbackPort];
        const hostData = (host.match(isipv6 ? /(.*\])\:(\d{1,5})/ : /(.*)\:(\d{1,5})/) || addedPort);

        return new HostData(hostData[1] as string, hostData[2] as number);
    }

    async doLogin() {
        let hostname: string | undefined = $("#login__hostname").val() as string | undefined;
        //.var password = $('#login__password').val(); // Not used, add to allow opening ports to the public?
        const remember = $("#login__remember").is(":checked");
        const autologin = $("#login__automatically").is(":checked");

        if (hostname === undefined) { return; }

        hostname = hostname.trim();

        $("#login__hostname").val(hostname);

        remember ? Settings.set("login__hostname", hostname) : Settings.reset("login__hostname");

        Settings.set("login__automatically", autologin);

        let loadingTimeout: number | undefined;
        let notificationId: number | undefined;

        // If connecting takes more than 100ms, do not show the "connecting" modal.
        // This hides it if you are immediately connected, but shows it if there's any issues or delays.
        loadingTimeout = setTimeout(() => {
            Log.debug("Connecting is not instant, showing 'Connecting' window.");
            notificationId = (Notifications.fullscreenNotification({
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                onOpen: swal.showLoading,
                showConfirmButton: false,
                title: "Connecting to VoliBot",
                type: "info",
            })).id;
        }, 100);

        const hostnames: string[] = hostname.split(",");
        const success: boolean[] = new Array<boolean>();

        for (const index in hostnames) {
            if (typeof index === "string") {
                const hostData = this.parseHost(hostnames[index], 8000);
                success.push(await VoliBotManager.addVoliBotInstance(hostData.url, hostData.port));
            }
        }

        if (loadingTimeout !== undefined) {
            clearTimeout(loadingTimeout);
        }
        if (notificationId !== undefined) {
            Notifications.closeFullscreenNotification(notificationId);
        }

        Log.info(`Connected to ${success.filter((x) => x).length} out of ${success.length} instance(s).`);
        if (VoliBotManager.connectedInstanceCount === 0) {
            Notifications.fullscreenNotification({
                showConfirmButton: true,
                text: "Check the IP Address / Hostname and make sure that VoliBot is up and running",
                title: "Failed to connect",
                type: "error",
            });
        } else {
            UI.currentScreen = "Main";

            for (let i = 0; i < success.length; i++) {
                if (!success[i]) {
                    Notifications.addNotification(
                        "Failed to connect to instance:",
                        hostnames[i],
                        "fa fa-exclamation-circle",
                    );
                }
            }
        }
    }

    onClose(info?: CloseEvent): void {
        //Disconnected: info.code == 1006??
        //.https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes

        Log.debug("Ws closed: ");
        Log.debug(info);

        if (this.pageUnloading) { return; }

        if (!info || !info.wasClean) {
            if (this.connected) {
                swal("Disconnected", "You have been disconnected from VoliBot", "info");
            } else {
                swal({
                    showConfirmButton: true,
                    text: "Check the IP Address / Hostname and make sure that VoliBot is up and running",
                    title: "Failed to connect",
                    type: "error",
                });
            }
        } else {
            $("#login__automatically").prop("checked", false);
            window.localStorage.setItem("login__automatically", ""); //TODO: Settings!!
        }
    }

    onOpen() {
        this.connected = true;
        swal.close();

        anime.timeline().add({
            duration: 750,
            easing: "easeInOutQuart",
            targets: "#LoginView",
            translateY: "-110%",
        }).add({
            duration: 750,
            easing: "easeInOutQuart",
            offset: "-=650",
            targets: "#MainView",
            translateY: "0%",
        });
    }
}
