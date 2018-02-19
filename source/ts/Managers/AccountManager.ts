import { LeagueAccount } from '../Models/LeagueAccount';
import { IManager } from "./IManager";
import { VoliBotManager, Log } from "./";

export class AccountsManager implements IManager {
    initialize(){}

    addAccount(account: LeagueAccount, onSuccess?: (account: LeagueAccount) => void, onFail?: (account: LeagueAccount) => void){
        var instance = VoliBotManager.instanceWithLeastAccounts;
        if (instance)
            instance.addAccount(account, onSuccess, onFail);
        else
            Log.error(`Could not add account: No suitable VoliBots instances found.`)
    }
}

export var Accounts = new AccountsManager();