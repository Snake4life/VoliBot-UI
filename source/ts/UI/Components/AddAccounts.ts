import * as $ from 'jquery';
import { LeagueAccount } from '../../Models/LeagueAccount';
import { LeagueRegion } from '../../Models/LeagueRegion';
import { LeagueAccountSettings } from '../../Models/LeagueAccountSettings';
import { Accounts, Log, Notifications } from '../../Managers';
import { UiComponentBase } from './';

export class ComponentAddAccount extends UiComponentBase {
    hookUi(): void {
        $("#AddAccount_Submit").click(this.doAddAccount);
    }

    private doAddAccount(){
        var username: string = $("#AddAccount_Username").val() as string;
        var password: string = $("#AddAccount_Password").val() as string;
        var server: string = $("#AddAccount_Server").val() as string;
        var queueString: string = $("#AddAccount_Queue").val() as string;
        var queue: number = parseInt(queueString, 10);
        var autoplay: boolean = $("#AddAccount_AutoPlay").is(":checked");
    
        const parsedRegion: LeagueRegion | undefined = (<any>LeagueRegion)[server];
        if(parsedRegion !== undefined){
            Log.info(`Adding account:\nName: ${username}, Server: ${server}, Queue: ${queue}(${queueString}), AutoPlay: ${autoplay}`)
            let account: LeagueAccount = new LeagueAccount(username, password, parsedRegion, new LeagueAccountSettings(queue, autoplay));
            Accounts.addAccount(account,
                account => {
                    Notifications.addNotification(null, "Successfully added account!", `${account.region} | ${account.username}`);
                }, account => {
                    Notifications.addNotification(null, "Successfully added account!", `${account.region} | ${account.username}`);
            });
        } else {
            Log.warn(`Adding account failed (Failed to parse Region):\nName: ${username}, Server: ${server}, Queue: ${queue} (${queueString}), AutoPlay: ${autoplay}`)
        }
    }
}