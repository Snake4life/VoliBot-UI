import * as $ from "jquery";
import { Accounts, Log, Notifications } from "../../Managers";
import { LeagueAccount } from "../../Models/LeagueAccount";
import { LeagueAccountSettings } from "../../Models/LeagueAccountSettings";
import { LeagueRegion } from "../../Models/LeagueRegion";
import { ComponentBase } from "./";

export class ComponentAddAccount extends ComponentBase {
    hookUi(): void {
        $("#AddAccount_Submit").click(this.doAddAccount);
    }

    private doAddAccount() {
        const username: string = $("#AddAccount_Username").val() as string;
        const password: string = $("#AddAccount_Password").val() as string;
        const server: string = $("#AddAccount_Server").val() as string;
        const queueString: string = $("#AddAccount_Queue").val() as string;
        const queue: number = parseInt(queueString, 10);
        const autoplay: boolean = $("#AddAccount_AutoPlay").is(":checked");

        const parsedRegion: LeagueRegion | undefined = (LeagueRegion as any)[server];
        if (parsedRegion !== undefined) {
            // tslint:disable-next-line:max-line-length
            Log.info(`Adding account:\nName: ${username}, Server: ${server}, Queue: ${queue}(${queueString}), AutoPlay: ${autoplay}`);

            const account: LeagueAccount = new LeagueAccount(
                username,
                password,
                parsedRegion,
                new LeagueAccountSettings(queue, autoplay),
            );

            Accounts.addAccount(account,
                (acc) => {
                    Notifications.addNotification(
                        null,
                        "Successfully added account!",
                        `${acc.region} | ${acc.username}`,
                    );
                }, (acc) => {
                    Notifications.addNotification(
                        null,
                        "Successfully added account!",
                        `${acc.region} | ${acc.username}`,
                    );
            });
        } else {
            // tslint:disable-next-line:max-line-length
            Log.warn(`Adding account failed (Failed to parse Region):\nName: ${username}, Server: ${server}, Queue: ${queue} (${queueString}), AutoPlay: ${autoplay}`);
        }
    }
}
