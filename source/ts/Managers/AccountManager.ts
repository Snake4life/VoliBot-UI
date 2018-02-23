import { LeagueAccount } from "../Models/LeagueAccount";
import { Log, VoliBotManager } from "./";
import { Manager } from "./Manager";

export class AccountsManager extends Manager {
    addAccount(
        account: LeagueAccount,
        onSuccess?: (account: LeagueAccount) => void,
        onFail?: (account: LeagueAccount) => void): void {
        const instance = VoliBotManager.instanceWithLeastAccounts;
        if (instance) {
            instance.addAccount(account, onSuccess, onFail);
        } else {
            Log.error("Could not add account: No suitable VoliBots instances found.");
        }
    }
}

export const Accounts = new AccountsManager();
