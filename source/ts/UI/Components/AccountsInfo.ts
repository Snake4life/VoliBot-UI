import * as $ from "jquery";
import { ComponentBase } from "./";

//#region Things you should probably avoid touching if you don't have a better solution.
// I have no clue WHY this works, but it works, so I'm going to leave it here.
// If someone feels like fixing it, PLEASE do, but be prepared to spend some time with it.
//TODO: This REALLY shouldn't be done this way.
//WARNING: This REALLY REALLY shouldn't be done this way.
declare var require: any;
import "datatables.net";
import "datatables.net-select";
import { Log } from "../../Managers";
import { VoliClient } from "../../VoliClient";
// tslint:disable-next-line:no-var-requires
require("datatables.net")(window, $);
// tslint:disable-next-line:no-var-requires
require("datatables.net-select")(window, $);
//#endregion

export class ComponentAccountsInfo extends ComponentBase {
    private initialized: boolean = false;
    private accountInfo: JQuery<HTMLElement> | undefined = undefined;
    private nonSelected: JQuery<HTMLElement> | undefined = undefined;
    private dataTable: any = undefined;

    private extractButton: JQuery<HTMLElement> | undefined = undefined;

    private set selectedAccountsCount(val: number) {
        $(".accounts-preview__selected_accounts")
            .text(`${val} account${val === 1 ? "" : "s"} selected`);
    }

    private set showAccountInfo(val: boolean) {
        if (this.nonSelected == null || this.accountInfo == null) { return; }
        if (val) {
            this.nonSelected.hide();
            this.accountInfo.show();
        } else {
            this.nonSelected.show();
            this.accountInfo.hide();
        }
    }

    hookUi(): void {
        this.accountInfo = $(".accounts-preview__selected");
        this.nonSelected = $(".accounts-preview__no_selected");
        this.dataTable = $(".datatable").DataTable();
        this.extractButton = $(".accounts-preview__extract");

        this.showAccountInfo = false;

        this.dataTable
            .on("select.dt", this.updateAccountsInfo.bind(this))
            .on("deselect.dt", this.updateAccountsInfo.bind(this));

        $(".accounts-preview__extract")
            .click(this.extractAccounts.bind(this));

        this.initialized = true;
    }

    private updateAccountsInfo(_e: any, dt: any, type: any, _indexes: any) {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }

        if (type === "row") {
            const data = dt.rows({ selected: true }).data();
            if (data.length === 0) {
                this.showAccountInfo = false;
            } else {
                this.showAccountInfo = true;
                this.selectedAccountsCount = data.length;
            }
        }
    }

    private extractAccounts() {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }
        if (!this.extractButton) { throw new Error(`Failed to retrive ${"extractButton"} from DOM`); }

        const selectedAccounts = this.dataTable.rows({ selected: true }).data();

        let output: string = "";

        for (const i of selectedAccounts.length) {
            const account = selectedAccounts[i] as VoliClient;
            Log.debug(`${account.summoner.accountId}:${account.summoner.displayName}`);
            output += `${account.summoner.accountId}:${account.summoner.displayName}\r\n`;
        }

        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(output));
        element.setAttribute("download", "accounts.txt");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}
