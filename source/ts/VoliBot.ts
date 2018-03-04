import { Log } from "./Managers";
/* global Chart */ // Chart.js

// FUCK JS AND EVERYTHING IT STANDS FOR
// REWRITE THE ENTIRE THING TO TS
// NO MATTER HOW LONG IT'LL TAKE
// IT'LL BE WORTH IT TO USE A SANE LANGUAGE

import { LeagueAccount } from "./Models/LeagueAccount";
import { LeagueAccountSettings } from "./Models/LeagueAccountSettings";

export class VoliBot {
    socket: WebSocket;
    serverId: string;
    private clients: { [id: string]: LeagueAccount } = { };
    private wsCallbacks: { [id: string]: (data: any, serverId: string, packet: any) => void } = { };

    constructor(
        hostname: string,
        port: number,
        onOpen?: (bot: VoliBot, args?: any[]) => void,
        onClose?: (bot: VoliBot, args?: any[]) => void) {
        this.serverId = hostname;
        this.socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");

        this.socket.onopen = async (...args: any[]) => {
            this.addCallbackHandler("UpdatedDefaultSettings", this.onUpdatedDefaultSettings.bind(this));
            this.addCallbackHandler("CreatedAccount",         this.onCreatedAccount.bind(this));
            this.addCallbackHandler("DeletedAccount",         this.onDeletedAccount.bind(this));
            this.addCallbackHandler("UpdatedAccount",         this.onUpdatedAccount.bind(this));
            //-this.addCallbackHandler("AccountsList",           this.onAccountsList.bind(this));

            const allClients: LeagueAccount[] = await this.getAccountList();
            if (allClients == null) {
                return;
            }

            allClients.forEach((x) => {
                if (x == null) {
                    return;
                }
                x.serverId = this.serverId;
                this.clients[x.accountId] = x;
            }, this);

            if (onOpen !== undefined) {
                onOpen(this, ...args);
            }
        };

        this.socket.onerror = (error: Event) => {
            Log.warn("WebSocket onError: " + JSON.stringify(error));
        };

        this.socket.onclose = (...args: any[]) => {
            if (onClose !== undefined) {
                onClose(this, ...args);
            }
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data: any = JSON.parse(event.data);
            Log.debug("Received data: " + JSON.stringify(data));
            if ((data[0] === MessageType.RESPONSE_ERROR || data[0] === MessageType.RESPONSE_SUCCESS) &&
                this.wsCallbacks[data[1]] != null) {
                this.wsCallbacks[data[1]].call(this, data[2], this.serverId, data);
            }

            if (data[0] === MessageType.EVENT && this.wsCallbacks[data[1]] != null) {
                this.wsCallbacks[data[1]].call(this, data[2], this.serverId, data);
            }
        };
    }

    addCallbackHandler(id: string, handler: (data: any, serverId: string, packet: any) => void): void {
        if (this.wsCallbacks[id]) {
            const originalCallback: (data: any, serverId: string, packet: any) => void = this.wsCallbacks[id];
            this.wsCallbacks[id] = (x, serverId, packet) => {
                originalCallback(x, serverId, packet);
                handler(x, serverId, packet);
            };
        } else {
            this.wsCallbacks[id] = handler;
        }
    }

    get ClientsCount(): number {
        return Object.keys(this.clients).length;
    }

    get ClientsArray(): LeagueAccount[] {
        return Object.keys(this.clients).map((x) => this.clients[x]);
    }

    //#region Base functions; things used internally for other functions to work
    shutdown(): void {
        if (this.socket.readyState === this.socket.CLOSED || this.socket.readyState === this.socket.CLOSING) {
            return;
        }
        this.socket.close();
    }

    async sendAsync(request: string, data?: any): Promise<any> {
        return new Promise<any>((resolve) => {
            const id: string = this.randomId();
            this.wsCallbacks[id] = function(received: any, _serverId: string, result: any): void {
                delete this.val;
                if (result[0] === MessageType.RESPONSE_SUCCESS) {
                    resolve(received);
                } else {
                    Log.error(`Received RESPONSE_ERROR for call: ${request}\nData: ${JSON.stringify(data)}`,
                              new Error(received));
                    resolve(undefined);
                }
            };
            this.socket.send(JSON.stringify([10, id, request, data]));
        });
    }
    //#endregion

    //#region Helpers; move to new class/file?
    randomId(): string {
        function s4(): string {
          return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    //#endregion

    //#region New spec
    async getAccountList(): Promise<LeagueAccount[]> {
        return this.sendAsync("GetAccountList");
    }

    async getDefaultSettings(): Promise<LeagueAccountSettings> {
        return this.sendAsync("GetDefaultSettings");
    }

    async getAccountDetails(accountId: number): Promise<LeagueAccount> {
        return this.sendAsync("GetAccountDetails", accountId);
    }

    async deleteAccount(accountId: number): Promise<boolean> {
        return this.sendAsync("DeleteAccount", accountId);
    }

    async createAccount(account: LeagueAccount): Promise<LeagueAccount | null> {
        return this.sendAsync("CreateAccount", account);
    }

    async updateAccountSettings(accountId: number, settings: LeagueAccountSettings): Promise<boolean> {
        return this.sendAsync("UpdateAccountSettings", {accountId, settings});
    }

    async updateDefaultSettings(settings: LeagueAccountSettings): Promise<boolean> {
        return this.sendAsync("UpdateDefaultSettings", settings);
    }
    //#endregion

    //#region Public functions
    getClientById(id: number): LeagueAccount | null {
        return this.clients[id] || null;
    }
    //#endregion

    //#region Websocket event handlers
    private onUpdatedDefaultSettings(_data: any) {
        // FEATURE: Default Settings
    }

    private onCreatedAccount(data: any) {
        const acc = data as LeagueAccount;
        acc.serverId = this.serverId;
        this.clients[acc.accountId] = acc;
    }

    private onDeletedAccount(id: any) {
        delete this.clients[id];
    }

    private onUpdatedAccount(data: any) {
        const acc = JSON.parse(data) as LeagueAccount;
        acc.serverId = this.serverId;
        Object.assign(this.clients[acc.accountId], acc);
    }

    //-private onAccountsList(_data: any) {
    //-     // FEATURE: Account Management
    //-}
}

export enum MessageType {
    REQUEST = 10,          // - intfc 2 srv [10, "RandomID" ,"RequestName", {requestdata}]
    RESPONSE_SUCCESS = 20, // - srv 2 intfc [20, "RandomID", {resultdata}]
    RESPONSE_ERROR = 30,   // - srv 2 intfc [30, "RandomID", "error message"]
    EVENT = 40,            // - srv 2 intfc [40, "EventName", {eventData}] ,
    MESSAGE_ERROR = 50,    // - srv 2 intfc [50, "original message as string", "error message"]
}
