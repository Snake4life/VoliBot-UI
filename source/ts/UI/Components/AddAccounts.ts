import * as $ from "jquery";
import { Accounts, Log, Notifications, VoliBotManager } from "../../Managers";
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
        $("#AddAccount .AddAccount_Add").click(this.onAddAccountClick.bind(this));

        $("#account_settings__credentials_li").click(() => this.mode = Modes.Add);
        $("#account_settings__import_li").click(() => this.mode = Modes.Import);
        this.importButton = $("#AddAccount .AddAccount_Import");
        this.importButton.click(this.importAccountFile.bind(this));
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

    private importAccountFile() {
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
                this.doAddAccount(username, password);
                break;
            case Modes.Import:
                this.currentImportingCreds.forEach((pair) => {
                    this.doAddAccount(pair[0], pair[1]);
                });
                this.currentImportingCreds = [];
                this.updateImportButtonText();
                break;
        }
    }

    private async doAddAccount(
        username: string,
        password: string,
    ) {
        const server: string      = $("#AddAccount select.AccountSettings_Server").val() as string;
        const queueString: string = $("#AddAccount select.AccountSettings_Queue").val() as string;
        const active: boolean   = $("#AddAccount .AccountSettings_AutoPlay").is(":checked");
        const queue: number = parseInt(queueString, 10);

        const parsedRegion: LeagueRegion | undefined = (LeagueRegion as any)[server];

        if (parsedRegion !== undefined) {
            // tslint:disable-next-line:max-line-length
            Log.info(`Adding account:\nName: ${username}, Server: ${server}, Queue: ${queue} (${queueString}), Active: ${active}`);

            const existingAccounts = VoliBotManager.getAllClients()
                                                   .filter((x) => x.username === username &&
                                                                  x.region === parsedRegion);

            if (existingAccounts.length > 0) {
                Notifications.addNotification(
                    null,
                    "Avoided duplicate registration.",
                    `${username} is already registered on core(s):\n` +
                    existingAccounts
                        .map((x) => x.serverId)
                        .join("\r\n"),
                    false,
                    undefined,
                    "fas fa-exclamation-triangle",
                );
            } else {
                const account: LeagueAccount = new LeagueAccount(
                    "",
                    -1,
                    username,
                    password,
                    parsedRegion,
                    new LeagueAccountSettings(queue, active, -1, -1), //TODO: TargetLevel & TargetBE
                    LeagueAccountStatus.None,
                    undefined,
                    undefined,
                );

                const result = await Accounts.addAccount(account);
                if (result != null) {
                    Notifications.addNotification(
                        null,
                        "Successfully added account!",
                        `Core: ${account.serverId}\nRegion: ${result.region}\nUsername: ${result.username}`,
                        true,
                        undefined,
                        "fas fa-check-circle",
                    );
                } else {
                    failedToAddAccount();
                }
            }
        } else {
            // tslint:disable-next-line:max-line-length
            Log.warn(`Adding account failed (Failed to parse Region):\nName: ${username}, Server: ${server}, Queue: ${queue}, Active: ${active}`);
            failedToAddAccount();
        }

        function failedToAddAccount() {
            Notifications.addNotification(
                null,
                "Failed to add account!",
                `Region: ${parsedRegion || "Unknown Region"}\nUsername: ${username}`,
                false,
                undefined,
                "fas fa-exclamation-triangle",
            );
        }
    }
}
