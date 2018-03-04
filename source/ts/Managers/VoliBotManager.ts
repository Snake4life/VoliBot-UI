import { LeagueAccount } from "../Models/LeagueAccount";
import { VoliBot } from "../VoliBot";

//TODO: Rename to something that makes sense
export class VoliBotManagerClass {
    private voliBotInstances: VoliBot[] = new Array<VoliBot>();
    private defaultWsCallbacks: { [id: string]: (data: any, serverId: string) => void } = { };
    private newVoliBotCore: (core: VoliBot) => void = (() => { /* */ });

    initialize() { /* */ }

    getAllClients() {
        let clients: LeagueAccount[] = [];

        this.voliBotInstances.forEach((x) => {
            clients = clients.concat(x.ClientsArray);
        });

        return clients;
    }

    doOnVoliBotConnected(handler: (core: VoliBot) => void) {
        const originalCallback = this.newVoliBotCore;
        this.newVoliBotCore = ((bot: VoliBot) => {
            originalCallback(bot);
            handler(bot);
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
                const voliBot = new VoliBot(url, port, (x) => {
                    this.onVoliBotOpen(x);
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

    getByServerId(serverId: string): VoliBot | undefined {
        const result = this.voliBotInstances.filter((bot) => bot.serverId === serverId);
        return result.length > 0 ? result[0] : undefined;
    }

    private onVoliBotOpen(volibot: VoliBot) {
        this.voliBotInstances.push(volibot);
        this.newVoliBotCore(volibot);
    }

    private onVoliBotClose(bot: VoliBot, _args: any) {
        this.removeBot(bot);
    }

    private removeBot(bot: VoliBot) {
        const index = this.voliBotInstances.indexOf(bot, 0);
        if (index > -1) {
            this.voliBotInstances.splice(index, 1);
        }
    }
}

export const VoliBotManager = new VoliBotManagerClass();
