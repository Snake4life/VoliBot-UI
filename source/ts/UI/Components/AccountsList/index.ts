// For some reason the official DataTables typings are far from complete.
// We solve this by manually adding the missing properties we need.
// tslint:disable-next-line:no-reference
/// <reference path="../../../@types/datatables-select.d.ts" />

import * as $ from "jquery";

import { ComponentBase } from "../";
import { VoliBotManager } from "../../../Managers";
import { VoliBot } from "../../../VoliBot";
import { VoliClient } from "../../../VoliClient";
import { VoliClientLevel } from "./VoliClientLevel";

//#region Things you should probably avoid touching if you don't have a better solution.
// I have no clue WHY this works, but it works, so I'm going to leave it here.
// If someone feels like fixing it, PLEASE do, but be prepared to spend some time with it.
//TODO: This REALLY shouldn't be done this way.
//WARNING: This REALLY REALLY shouldn't be done this way.
declare var require: any;
import "datatables.net";
import "datatables.net-select";
// tslint:disable-next-line:no-var-requires
require("datatables.net")(window, $);
// tslint:disable-next-line:no-var-requires
require("datatables.net-select")(window, $);
//#endregion

export class ComponentAccountsList extends ComponentBase {
    private accountsTable: any;

    hookUi(): void {
        VoliBotManager.addCallbackHandler("ListInstance", (x, y) => this.updateAccountsList(x[2].List, y));
        this.initializeDataTable();
    }

    updateAccountsList(clientsObject: {[id: string]: VoliClient}, serverId: string) {
        const clients = clientsObject == null ? [] : Object.keys(clientsObject).map((key) => clientsObject[key]);

        const updateClients: VoliClient[] = [];

        if (clients == null) {
            this.accountsTable.clear();
            return;
        }

        clients.forEach((x) => {
            if (x == null || x.summoner == null) { return; }

            x.serverId = serverId;
            updateClients.push(x);
        }, this);

        this.accountsTable.rows((_index: number, data: VoliBot) =>
            (data.serverId === serverId)).remove().rows.add(updateClients).draw();
    }

    private initializeDataTable() {
        this.accountsTable = $(".datatable").DataTable({
            columnDefs: [
                {
                    targets: 1,
                    render(data: VoliClientLevel, type) {
                        if (type === "display" || type === "filter") {
                            return `${data.level} (+${data.percent}%)`;
                        }
                        // Makes sure the percentage is never "100%". Mostly because it looks bad :)
                        return data.level + (Math.min(data.percent, 99) / 100);
                    },
                },
            ],
            columns: [
                { data: (x: VoliClient) => x.serverId || "Unknown" },
                { data: (x: VoliClient) => new VoliClientLevel(x) },
                { data: (x: VoliClient) => x.summoner.displayName },
                { data: (x: VoliClient) => x.status },
                { data: (x: VoliClient) => x.summoner.summonerId },
                { data: (x: VoliClient) => x.wallet.ip },
                { data: (x: VoliClient) => x.wallet.rp },
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
