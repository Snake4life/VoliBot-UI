import { VoliBot } from '../VoliBot';
import { LeagueAccount } from '../Models/LeagueAccount';
import { IManager } from "./IManager";

export class AccountsManager implements IManager {
    initialize(){}

    voliBots: VoliBot[];

    constructor(voliBots?: VoliBot[]){
        this.voliBots = voliBots || new Array<VoliBot>();
    }

    addAccount(account: LeagueAccount){
        account;
        //let orderedBots = this.voliBots.sort((a,b) => (a.ClientCount > b.ClientCount) ? 1 : ((b.ClientCount > a.ClientCount) ? -1 : 0));
        //orderedBots[0].addAccount(account);
    }
}

export var Accounts = new AccountsManager();