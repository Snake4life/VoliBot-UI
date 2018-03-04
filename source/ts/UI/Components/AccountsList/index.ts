// For some reason the official DataTables typings are far from complete.
// We solve this by manually adding the missing properties we need.
// tslint:disable-next-line:no-reference
/// <reference path="../../../@types/datatables-select.d.ts" />

import * as $ from "jquery";

import { ComponentBase } from "../";
import { VoliBotManager } from "../../../Managers";
import { LeagueAccount } from "../../../Models/LeagueAccount";
import { LeagueAccountStatus } from "../../../Models/LeagueAccountStatus";
import { LeagueAccountLevel } from "./LeagueAccountLevel";

//#region Things you should probably avoid touching if you don't have a better solution.
// I have no clue WHY this works, but it works, so I'm going to leave it here.
// If someone feels like fixing it, PLEASE do, but be prepared to spend some time with it.
//TODO: This REALLY shouldn't be done this way.
//WARNING: This REALLY REALLY shouldn't be done this way.
declare var require: any;
import "datatables.net";
import "datatables.net-select";
// tslint:disable:no-var-requires
require("datatables.net")(window, $);
require("datatables.net-select")(window, $);
// tslint:enable:no-var-requires
//#endregion

export class ComponentAccountsList extends ComponentBase {
    private accountsTable: any;
    private statusText: {[index: number]: string} = {
        [LeagueAccountStatus.None]:             "Inactive",
        [LeagueAccountStatus.LoggedIn]:         "Logged in",
        [LeagueAccountStatus.ChampionSelect]:   "In champion select",
        [LeagueAccountStatus.ConnectingToGame]: "Loading game",
        [LeagueAccountStatus.InGame]:           "In game",
        [LeagueAccountStatus.EndOfGame]:        "At end of game",
        [LeagueAccountStatus.Reconnecting]:     "Reconnecting to game",
    };

    hookUi(): void {
        VoliBotManager.addCallbackHandler("CreatedAccount", this.onCreatedAccount.bind(this));
        VoliBotManager.addCallbackHandler("DeletedAccount", this.onDeletedAccount.bind(this));
        VoliBotManager.addCallbackHandler("UpdatedAccount", this.onUpdatedAccount.bind(this));

        this.initializeDataTable();

        VoliBotManager.doOnVoliBotConnected((instance) => {
            this.accountsTable
                .rows
                .add(instance.ClientsArray)
                .draw();
        });

        //TODO: Handle all events
    }

    onCreatedAccount(account: LeagueAccount, serverId: string) {
        account.serverId = serverId;
        this.accountsTable
            .row
            .add(account)
            .draw();
    }

    onDeletedAccount(accountId: number, serverId: string) {
        this.accountsTable
            .rows((_index: number, data: LeagueAccount) =>
                    data.serverId === serverId &&
                    data.accountId === accountId)
            .remove()
            .draw();
    }

    onUpdatedAccount(account: LeagueAccount, serverId: string) {
        account.serverId = serverId;
        Array.from<LeagueAccount>(this.accountsTable
            .rows((_index: number, data: LeagueAccount) =>
                    data.serverId === serverId &&
                    data.accountId === account.accountId)
            .data())
            .forEach((_element: LeagueAccount) => {
                Object.assign(_element, account);
            });

        this.accountsTable.draw();
    }

    private initializeDataTable() {
        this.accountsTable = $(".datatable").DataTable({
            columnDefs: [
                {
                    targets: 1,
                    render(data: LeagueAccountLevel, type) {
                        if (type === "display" || type === "filter") {
                            // Make sure the percentage is never "100%". Mostly because it looks bad :)
                            return `${data.level} (+${Math.min(data.percent, 99)}%)`;
                        }

                        return data.level + (data.percent / 100);
                    },
                },
            ],
            columns: [
                { data: (x: LeagueAccount) => x.serverId != null ? x.serverId : "Unknown" },
                { data: (x: LeagueAccount) => new LeagueAccountLevel(x) },
                { data: (x: LeagueAccount) => x.summoner != null ? x.summoner.displayName    : `[${x.username}]` },
                { data: (x: LeagueAccount) => x.status   != null ? this.statusText[x.status] : "Loading..." },
                { data: (x: LeagueAccount) => x.summoner != null ? x.summoner.summonerId     : "Unknown" },
                { data: (x: LeagueAccount) => x.wallet   != null ? x.wallet.ip               : "Unknown" },
                { data: (x: LeagueAccount) => x.wallet   != null ? x.wallet.rp               : "Unknown" },
            ],
            language: {
                info: "Registered accounts: _TOTAL_",
                select: {
                    rows: {
                        _: "",
                    },
                },
            },
            lengthChange: true,
            order: [[ 1, "desc" ]],
            ordering: true,
            paging: false,
            select: {
                style: "os",
            },
        });

        $('a[data-toggle="tab"]').on("shown.bs.tab", () => {
            this.accountsTable.columns.adjust();
        });

        const table = this.accountsTable;
        $(".datalist-filter__search input").on("keyup", function(this: HTMLInputElement) {
            table.search(this.value).draw();
        });
    }
}
