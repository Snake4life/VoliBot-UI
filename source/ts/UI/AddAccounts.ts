import * as $ from 'jquery';
import { LeagueAccount } from '../Models/LeagueAccount';
import { LeagueRegion } from '../Models/LeagueRegion';
import { LeagueAccountSettings } from '../Models/LeagueAccountSettings';
import { Managers } from '../Managers';
import { UiComponentBase } from './Components';

export class UiAddAccount extends UiComponentBase {
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
            let account: LeagueAccount = new LeagueAccount(username, password, parsedRegion, new LeagueAccountSettings(queue, autoplay));
            Managers.AccountManager.addAccount(account);
        }
    }
}