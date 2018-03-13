import * as $ from "jquery";
import { Accounts, Log, Notifications } from "../../Managers";
import { LeagueAccount } from "../../Models/LeagueAccount";
import { LeagueAccountSettings } from "../../Models/LeagueAccountSettings";
import { LeagueAccountStatus } from "../../Models/LeagueAccountStatus";
import { LeagueRegion } from "../../Models/LeagueRegion";
import { ComponentBase } from "./";

enum Modes {
    Add,
    Import,
}

export class ComponentAddAccount extends ComponentBase {
    private importButton: JQuery<HTMLElement> = $();
    private saveChangesButton: JQuery<HTMLElement> = $();
    private regionSelectInput: JQuery<HTMLElement> = $();
    private queueSelectInput: JQuery<HTMLElement> = $();
    private activeToggleInput: JQuery<HTMLElement> = $();

    private currentImportingCreds: string[][] = [];

    private _mode: Modes = Modes.Add;
    private set mode(mode: Modes) {
        if (mode !== this._mode) {
            this._mode = mode;
            this.currentImportingCreds = [];
            this.updateImportButtonText();
        }
    }
    private get mode() {
        return this._mode;
    }

    hookUi(): void {
        //TODO: Standardize naming in PUG
        $("#AddAccount .AddAccount_Add").click(this.onAddAccountClick.bind(this));

        $("#account_settings__credentials_li").click(() => this.mode = Modes.Add);
        $("#account_settings__import_li").click(() => this.mode = Modes.Import);

        this.regionSelectInput = $("#AddAccount select.AccountSettings_Server");
        this.queueSelectInput = $("#AddAccount select.AccountSettings_Queue");

        this.activeToggleInput = $("#AddAccount .AccountSettings_AutoPlay");

        this.saveChangesButton = $("#accounts-preview__save_changes");
        this.importButton = $("#AddAccount .AddAccount_Import");

        this.saveChangesButton.click(this.onSaveChangesClick.bind(this));
        this.importButton.click(this.onImportAccountClick.bind(this));
        this.updateImportButtonText();
    }

    private updateImportButtonText() {
        if (this.currentImportingCreds.length > 0) {
            // tslint:disable-next-line:max-line-length
            this.importButton.text(`Ready to import ${this.currentImportingCreds.length} account${this.currentImportingCreds.length === 1 ? "" : "s"}`);
        } else {
            this.importButton.text("Select accounts.txt");
        }
    }

    private async onSaveChangesClick() {
        this.doSaveChanges(Array.from<LeagueAccount>(Accounts.table.rows({ selected: true }).data() as any));
    }

    private async doSaveChanges(
        accounts: LeagueAccount[],
    ) {
        const region: string = this.regionSelectInput.val() as string;
        const queueString: string = this.queueSelectInput.val() as string;
        const active: boolean = this.activeToggleInput.is(":checked");
        const queue: number = parseInt(queueString, 10);
        const parsedRegion: LeagueRegion | undefined = (LeagueRegion as any)[region];

        if (parsedRegion !== undefined) {
            const settings: LeagueAccountSettings = new LeagueAccountSettings(//TODO: TargetLevel & TargetBE
                queue,
                active,
                -1,
                -1,
            );

            const results = await Accounts.updateAccountSettings(accounts, settings);
            const success = (results.filter((x) => x.result === true)
                                   .map((x) => Accounts.getAccountByIds(x.serverId, x.accountId))
                                   .filter((x) => x != null) as LeagueAccount[])
                                   .map((x) => `[${x.serverId}] ${x.username}`);
            const fail = (results.filter((x) => x.result === false)
                                .map((x) => Accounts.getAccountByIds(x.serverId, x.accountId))
                                .filter((x) => x != null) as LeagueAccount[])
                                .map((x) => `[${x.serverId}] ${x.username}`);

            if (success.length > 0) {
                Notifications.addNotification(
                    null,
                    `Successfully applied changes to account${success.length === 1 ? "" : "s"}.`,
                    success.join("\n"),
                    true,
                    undefined,
                    "fas fa-check-circle",
                );
            }

            if (fail.length > 0) {
                Notifications.addNotification(
                    null,
                    `Failed to apply changes to account${fail.length === 1 ? "" : "s"}.`,
                    fail.join("\n"),
                    false,
                    undefined,
                    "fas fa-exclamation-triangle",
                );
            }
        } else {
            // tslint:disable-next-line:max-line-length
            Log.warn(`Modifying account failed (Failed to parse Region): ${region}`);
            Notifications.addNotification(
                null,
                "Failed to parse the selected settings.",
                "This shouldn't happen, please tell the VoliBot team about it :)",
                false,
                undefined,
                "fas fa-exclamation-triangle",
            );
        }
    }

    private onImportAccountClick() {
        const input = $(document.createElement("input"));
        input.attr("type", "file");
        input.attr("accept", "text/plain");
        input.change((evt) => {
            const files = (evt.target as HTMLInputElement).files;
            if (files != null && files.length > 0) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.parseAccountFile(reader.result);
                    this.updateImportButtonText();
                };
                reader.readAsText(files[0]);
            }
        });
        input.trigger("click");
        return false;
    }

    private parseAccountFile(data: string) {
        let failed: string[] = [];

        data.split("\n").forEach((raw) => {
            const pair = raw.replace(/^\s+|\s+$/g, "").split(":");
            if (pair.length === 2) {
                // Avoid duplicates
                pair[0] = pair[0].trim();
                pair[1] = pair[1].trim();

                if ((pair[0].length !== 0) &&
                    (pair[1].length !== 0) &&
                    !this.currentImportingCreds.some((e) => e[0] === pair[0])) {
                    this.currentImportingCreds = this.currentImportingCreds.concat([pair]);
                }
            } else {
                if (raw.trim().length > 0) {
                    failed = failed.concat([raw]);
                }
            }
        });

        if (failed.length > 0) {
            Notifications.addNotification(
                null,
                "Invalid entries found in accounts file:",
                failed.join("\n"),
                false,
                undefined,
                "fas fa-exclamation-triangle",
            );
        }
    }

    private async onAddAccountClick() {
        switch (this.mode) {
            case Modes.Add:
                const username: string    = $("#AddAccount .AddAccount_Username").val() as string;
                const password: string    = $("#AddAccount .AddAccount_Password").val() as string;
                this.doAddAccount([{username, password}]);
                break;
            case Modes.Import:
                this.doAddAccount(this.currentImportingCreds.map((x) => ({username: x[0], password: x[1]})));
                this.currentImportingCreds = [];
                this.updateImportButtonText();
                break;
        }
    }

    private async doAddAccount(accounts: Array<{username: string, password: string}>) {
        const region: string = this.regionSelectInput.val() as string;
        const queueString: string = this.queueSelectInput.val() as string;
        const active: boolean = this.activeToggleInput.is(":checked");
        const queue: number = parseInt(queueString, 10);
        const parsedRegion: LeagueRegion | undefined = (LeagueRegion as any)[region];

        if (parsedRegion !== undefined) {
            const settings: LeagueAccountSettings = new LeagueAccountSettings(//TODO: TargetLevel & TargetBE
                queue,
                active,
                -1,
                -1,
            );

            const leagueAccounts = accounts.map((x) =>
                new LeagueAccount(
                    undefined,
                    -1,
                    x.username,
                    x.password,
                    parsedRegion,
                    settings,
                    LeagueAccountStatus.None,
                    undefined,
                    undefined,
                ));

            const results = await Accounts.createAccount(leagueAccounts);
            const success = (results.map((x) => x.result)
                                    .filter((x) => typeof x !== "string") as LeagueAccount[])
                                    .map((x) => `[${x.username}] ${x.serverId}`);

            const fail = results.filter((x) => typeof x.result === "string")
                                .map((x) => `[${x.account.username}] ${x.result}`);

            if (success.length > 0) {
                if (success.length > 5) {
                    successNotification(success);
                } else {
                    success.forEach(successNotification);
                }

                function successNotification(name: string | string[]) {
                    Notifications.addNotification(
                        null,
                        `Successfully added account${Array.isArray(name) && name.length !==  1 ? "s" : ""}.`,
                        Array.isArray(name) ?
                            name.slice(0, 10).join("\n") + (name.length > 10 ? `<br>+${name.length - 10} more` : "") :
                            name,
                        true,
                        undefined,
                        "fas fa-check-circle",
                    );
                }
            }

            if (fail.length > 0) {
                fail.forEach((x) =>
                    Notifications.addNotification(
                        null,
                        "Failed to add account.",
                        x,
                        false,
                        undefined,
                        "fas fa-exclamation-triangle",
                    ));
            }
        } else {
            Log.warn(`Adding account failed (Failed to parse Region): ${region}`);
            Notifications.addNotification(
                null,
                "Failed to parse the selected settings.",
                "This shouldn't happen, please tell the VoliBot team about it :)",
                false,
                undefined,
                "fas fa-exclamation-triangle",
            );
        }
    }
}
