import { LeagueAccount } from "../Models/LeagueAccount";
import { Log, VoliBotManager } from "./";
import { Manager } from "./Manager";

export class AccountsManager extends Manager {
    async addAccount(account: LeagueAccount): Promise<LeagueAccount | null> {
        const instance = VoliBotManager.instanceWithLeastAccounts;
        if (instance) {
            account.serverId = instance.serverId;
            return instance.createAccount(account);
        } else {
            Log.error("Could not add account: No suitable VoliBots instances found.");
        }

        return Promise.resolve(null);
    }
}

export const Accounts = new AccountsManager();
