import VoliBot from '../VoliBot';
import LeagueAccount from '../Models/LeagueAccount';

export default class AccountManager {
    voliBots: VoliBot[];

    constructor(voliBots?: VoliBot[]){
        debugger;
        this.voliBots = voliBots || new Array<VoliBot>();
    }

    addAccount(account: LeagueAccount){
        account;
        //let orderedBots = this.voliBots.sort((a,b) => (a.ClientCount > b.ClientCount) ? 1 : ((b.ClientCount > a.ClientCount) ? -1 : 0));
        //orderedBots[0].addAccount(account);
    }
}