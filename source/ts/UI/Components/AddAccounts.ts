import * as $ from "jquery";
import { Accounts, Log, Notifications } from "../../Managers";
import { LeagueAccount } from "../../Models/LeagueAccount";
import { LeagueAccountSettings } from "../../Models/LeagueAccountSettings";
import { LeagueAccountStatus } from "../../Models/LeagueAccountStatus";
import { LeagueRegion } from "../../Models/LeagueRegion";
import { ComponentBase } from "./";

export class ComponentAddAccount extends ComponentBase {
    hookUi(): void {
        $("#AddAccount .AddAccount_Add").click(this.doAddAccount);
    }

    private async doAddAccount() {
        const username: string    = $("#AddAccount .AddAccount_Username").val() as string;
        const password: string    = $("#AddAccount .AddAccount_Password").val() as string;
        const server: string      = $("#AddAccount select.AccountSettings_Server").val() as string;
        const queueString: string = $("#AddAccount select.AccountSettings_Queue").val() as string;
        const autoplay: boolean   = $("#AddAccount .AccountSettings_AutoPlay").is(":checked");
        const queue: number = parseInt(queueString, 10);

        const parsedRegion: LeagueRegion | undefined = (LeagueRegion as any)[server];
        if (parsedRegion !== undefined) {
            // tslint:disable-next-line:max-line-length
            Log.info(`Adding account:\nName: ${username}, Server: ${server}, Queue: ${queue}(${queueString}), AutoPlay: ${autoplay}`);

            //TODO: Implement this.
            //- const existingAccounts = VoliBotManager.getAllClients()
            //-                                        .filter((x) => x.username === username &&
            //-                                                       x.region === parsedRegion);

            //- if (existingAccounts.length > 0) {
            //-     Notifications.addNotification(
            //-         null,
            //-         "Account is already registered.",
            //-         `'${username} already exists on cores:\r\n` +
            //-         existingAccounts
            //-             .map((x) => x.serverId)
            //-             .join("\r\n"),
            //-         undefined,
            //-         undefined,
            //-         "fas fa-exclamation-triangle",
            //-     );
            //- } else {

            const account: LeagueAccount = new LeagueAccount(
                "",
                -1,
                username,
                password,
                parsedRegion,
                new LeagueAccountSettings(queue, autoplay, -1, -1), //TODO: TargetLevel & TargetBE
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
                    undefined,
                    undefined,
                    "fas fa-check-circle",
                );
            } else {
                failedToAddAccount();
            }

            //- }
        } else {
            // tslint:disable-next-line:max-line-length
            Log.warn(`Adding account failed (Failed to parse Region):\nName: ${username}, Server: ${server}, Queue: ${queue} (${queueString}), AutoPlay: ${autoplay}`);
            failedToAddAccount();
        }

        function failedToAddAccount() {
            Notifications.addNotification(
                null,
                "Failed to add account!",
                `Region: ${parsedRegion || "Unknown Region"}\nUsername: ${username}`,
                undefined,
                undefined,
                "fas fa-exclamation-triangle",
            );
        }
    }
}
