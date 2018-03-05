import { LeagueAccount } from "../Models/LeagueAccount";
import { VoliBot } from "../VoliBot";
import { Log, Notifications, UI } from "./";

//TODO: Rename to something that makes sense
export class VoliBotManagerClass {
    private voliBotInstances: VoliBot[] = new Array<VoliBot>();
    private defaultWsCallbacks: { [id: string]: (data: any, serverId: string) => void } = { };
    private voliBotConnected: (core: VoliBot, ev: Event) => void = (() => { /* */ });
    private voliBotDisconnected: (core: VoliBot, ev: CloseEvent) => void = (() => { /* */ });

    initialize() {
        const setFittingScreen = () => {
            if (this.connectedInstanceCount === 0) {
                UI.setCurrentScreen("Login");
            } else {
                UI.setCurrentScreen("Main");
            }
        };

        this.doOnVoliBotConnected(setFittingScreen);
        this.doOnVoliBotDisconnected(setFittingScreen);

        this.doOnVoliBotDisconnected((instance, ev) => {
            if (!instance.hasConnected || ev.wasClean) {return; }
            const id = Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 5);
            Notifications.addNotification(id,
                "Disconnected from a Core!",
                "You have disconnected from a Core, click here to attempt to reconnect.\n" +
                "CoreID: " + instance.serverId,
                false,
                () => attemptReconnect(id, instance),
                "fas fa-unlink",
            );
        });

        async function attemptReconnect(notificationId: string, instance: VoliBot) {
            Notifications.closeNotification(notificationId);
            if (await VoliBotManager.addVoliBotInstance(instance.hostname, instance.port)) {
                Notifications.addNotification(
                    notificationId,
                    "Reconnected to Core.",
                    `CoreID: ${instance.serverId}`,
                    true,
                    undefined,
                    "fas fa-check-circle",
                );
            } else {
                Notifications.addNotification(
                    notificationId,
                    "Could not reconnect to Core.",
                    "Click to try again.\n" +
                    `CoreID: ${instance.serverId}`,
                    false,
                    () => attemptReconnect(notificationId, instance),
                    "fas fa-exclamation-triangle",
                );
            }
        }
    }

    getAllClients(filter?: (account: LeagueAccount) => boolean) {
        let clients: LeagueAccount[] = [];

        this.voliBotInstances.forEach((x) => {
            clients = filter ? clients.concat(x.ClientsArray.filter(filter)) : clients.concat(x.ClientsArray);
        });

        return clients;
    }

    doOnVoliBotConnected(handler: (core: VoliBot, ev: Event) => void) {
        const originalCallback = this.voliBotConnected;
        this.voliBotConnected = ((bot: VoliBot, ev: Event) => {
            originalCallback(bot, ev);
            handler(bot, ev);
        }).bind(this);
    }

    doOnVoliBotDisconnected(handler: (core: VoliBot, ev: CloseEvent) => void) {
        const originalCallback = this.voliBotDisconnected;
        this.voliBotDisconnected = ((core: VoliBot, ev: CloseEvent) => {
            originalCallback(core, ev);
            handler(core, ev);
        }).bind(this);
    }

    addCallbackHandler(id: string, handler: (data: any, serverId: string) => void) {
        this.do((x) => x.addCallbackHandler(id, handler));
        if (this.defaultWsCallbacks[id]) {
            const originalCallback = this.defaultWsCallbacks[id];
            this.defaultWsCallbacks[id] = (x, y) => ((bot: VoliBot, serverId: string) => {
                originalCallback(bot, serverId);
                handler(bot, serverId);
            }).call(this, x, y);
        } else {
            this.defaultWsCallbacks[id] = handler;
        }
    }

    do(x: (voliBotInstance: VoliBot) => void) {
        this.voliBotInstances.forEach(x);
    }

    get connectedInstanceCount() {
        return this.voliBotInstances.length;
    }

    getSorted(compareFn: (a: VoliBot, b: VoliBot) => number) {
        return this.voliBotInstances.sort(compareFn);
    }

    get instanceWithLeastAccounts() {
        if (this.voliBotInstances.length <= 0) {
            return null;
        }
        return this.voliBotInstances.sort(
            (a, b) => (a.ClientsCount > b.ClientsCount) ? 1 : ((b.ClientsCount > a.ClientsCount) ? -1 : 0))[0];
    }

    async addVoliBotInstance(url: string, port: number) {
        return new Promise<boolean>((resolve) => {
            try {
                const voliBot = new VoliBot(url, port, (x, y) => {
                    this.onVoliBotOpen(x, y);
                    resolve(true);
                }, (x, y) => {
                    this.onVoliBotClose(x, y);
                    resolve(false);
                });

                Object.keys(this.defaultWsCallbacks)
                      .forEach((key: string) => voliBot.addCallbackHandler(key, this.defaultWsCallbacks[key]));
            } catch (e) {
                resolve(false);
            }
        });
    }

    getServerById(serverId: string): VoliBot | undefined {
        const result = this.voliBotInstances.filter((bot) => bot.serverId === serverId);
        return result.length > 0 ? result[0] : undefined;
    }

    private onVoliBotOpen(volibot: VoliBot, ev: Event) {
        this.voliBotInstances.push(volibot);
        this.voliBotConnected(volibot, ev);
    }

    private onVoliBotClose(volibot: VoliBot, ev: CloseEvent) {
        this.removeBot(volibot);
        this.voliBotDisconnected(volibot, ev);
    }

    private removeBot(bot: VoliBot) {
        const index = this.voliBotInstances.indexOf(bot, 0);
        if (index > -1) {
            this.voliBotInstances.splice(index, 1);
        } else {
            Log.warn("Failed to remove VoliBot instance from VoliBotManager.");
        }
    }
}

export const VoliBotManager = new VoliBotManagerClass();
