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
import { Log, Notifications, VoliBotManager } from "../../Managers";
import { LeagueAccount } from "../../Models/LeagueAccount";
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
    private removeButton: JQuery<HTMLElement> | undefined = undefined;

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
        this.removeButton = $(".accounts-preview__remove");

        this.showAccountInfo = false;

        this.dataTable
            .on("select.dt", this.onTableSelectionChanged.bind(this))
            .on("deselect.dt", this.onTableSelectionChanged.bind(this));

        this.extractButton.click(this.extractAccounts.bind(this));
        this.removeButton.click(this.removeAccounts.bind(this));

        VoliBotManager.addCallbackHandler("CreatedAccount", this.updateAccountsInfo.bind(this));
        VoliBotManager.addCallbackHandler("DeletedAccount", this.updateAccountsInfo.bind(this));
        VoliBotManager.addCallbackHandler("UpdatedAccount", this.updateAccountsInfo.bind(this));

        this.initialized = true;
    }

    private onTableSelectionChanged(_e: any, _dt: any, type: any) {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }

        if (type === "row") {
            this.updateAccountsInfo();
        }
    }

    private updateAccountsInfo() {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }

        const data = this.dataTable.rows({ selected: true }).data();
        if (data.length === 0) {
            this.showAccountInfo = false;
        } else {
            this.showAccountInfo = true;
            this.selectedAccountsCount = data.length;
        }
    }

    private extractAccounts() {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }
        if (!this.extractButton) { throw new Error(`Failed to retrive ${"extractButton"} from DOM`); }

        const selectedAccounts = this.dataTable.rows({ selected: true }).data();

        let output: string = "";

        for (const i of selectedAccounts.length) {
            const account = selectedAccounts[i] as LeagueAccount;
            output += `${account.username}:${account.password}\r\n`;
        }

        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(output));
        element.setAttribute("download", "accounts.txt");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    private async removeAccounts() {
        if (!this.initialized) { throw new Error("Can't call method before initializing!"); }
        if (!this.extractButton) { throw new Error(`Failed to retrive ${"extractButton"} from DOM`); }

        const selectedAccounts = this.dataTable.rows({ selected: true }).data();
        const swal = await Notifications.fullscreenNotification({
            focusCancel: true,
            showCancelButton: true,
            showConfirmButton: true,
            text: "After removing accounts, you can NOT restore them.<br>Do you want to continue?",
            title: `You are about to remove ${selectedAccounts.length} accounts.`,
            type: "warning",
        }).result;

        if (!swal.dismiss && swal.value === true) {
            for (const i of selectedAccounts.length) {
                const account = selectedAccounts[i] as LeagueAccount;
                let result = false;
                if (account.serverId === undefined) {
                    Log.warn("Can not remove account as serverId is undefined!");
                } else {
                    const bot = VoliBotManager.getByServerId(account.serverId);
                    if (bot === undefined) {
                        // tslint:disable-next-line:max-line-length
                        Log.warn(`Could not find server for account: [${account.serverId}] ${account.region}|${account.username}`);
                    } else {
                        result = await bot.deleteAccount(account.accountId);
                    }
                }

                Notifications.addNotification(
                    null,
                    result ? "Successfully removed account." : "Failed to remove account!",
                    `Username: ${account.username}\nRegion: ${account.region}\nCore: ${account.serverId}`,
                    result,
                    undefined,
                    result ? "fas fa-check-circle" : "fas fa-exclamation-triangle",
                );
            }
        }
    }
}
