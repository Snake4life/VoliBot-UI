import { LeagueAccount } from "../Models/LeagueAccount";
import { LeagueAccountSettings } from "../Models/LeagueAccountSettings";
import { Log, VoliBotManager } from "./";
import { Manager } from "./Manager";

export class AccountsManager extends Manager {
    private _accountsTable: DataTables.Api | undefined;

    set table(newTable: DataTables.Api) {
        if (this._accountsTable == null) {
            this._accountsTable = newTable;
        } else {
            throw new Error("Can not reassign accountsTable!");
        }
    }

    get table() {
        if (this._accountsTable == null) {
            throw new Error("Can not access accountsTable before initialization.");
        }

        return this._accountsTable;
    }

    async createAccount(accounts: LeagueAccount):
    Promise<{account: LeagueAccount, result: LeagueAccount | string}>;
    async createAccount(accounts: LeagueAccount[]):
    Promise<Array<{account: LeagueAccount, result: LeagueAccount | string}>>;
    async createAccount(
        accounts: LeagueAccount | LeagueAccount[],
    ): Promise<Array<{account: LeagueAccount, result: LeagueAccount | string}> |
                     {account: LeagueAccount, result: LeagueAccount | string}> {
        if (Array.isArray(accounts)) {
            return Promise.all(accounts.map((account) => createAccount(account)));
        } else {
            return createAccount(accounts);
        }

        async function createAccount(account: LeagueAccount):
        Promise<{account: LeagueAccount, result: LeagueAccount | string}> {
            const result: {account: LeagueAccount, result: LeagueAccount | string} = {account, result: "Unknown"};
            const exists = VoliBotManager.getAllClients((x) => x.username === account.username &&
                                                               x.region === account.region);
            if (exists.length === 0) {
                const instance = VoliBotManager.instanceWithLeastAccounts;
                if (instance) {
                    account.serverId = instance.serverId;
                    result.result = (await instance.createAccount(account)) || "Core could not create account.";
                } else {
                    Log.error("Could not add account: No suitable Cores found.");
                }
            } else {
                // tslint:disable-next-line:max-line-length
                result.result = `Account already registered on Core${exists.length === 1 ? "" : "s"}: ${exists.map((x) => x.serverId).join(", ")}`;
            }

            return result;
        }
    }

    getAccountByIds(serverId: string, accountId: number) {
        const server = VoliBotManager.getServerById(serverId);
        if (server != null) {
            return server.getClientById(accountId);
        }
        return null;
    }

    async updateAccountSettings(
        accounts: LeagueAccount[] |
                  Array<{accountId: number, serverId: string}>,
        settings: LeagueAccountSettings,
    ): Promise<Array<{accountId: number, serverId: string, result: boolean}>>;
    async updateAccountSettings(
        accounts: LeagueAccount |
                  {accountId: number, serverId: string},
        settings: LeagueAccountSettings,
    ): Promise<{accountId: number, serverId: string, result: boolean}>;
    async updateAccountSettings(
        accounts: Array<{accountId: number, serverId: string | undefined}> |
                  {accountId: number, serverId: string | undefined},
        settings: LeagueAccountSettings,
    ): Promise<Array<{accountId: number, serverId: string | undefined, result: boolean}> |
                     {accountId: number, serverId: string | undefined, result: boolean}> {
        if (Array.isArray(accounts)) {
            return Promise.all(accounts.map((account) => {
                const serverId = account.serverId;
                if (serverId != null) {
                    return updateSettings({accountId: account.accountId, serverId});
                } else {
                    return Promise.resolve({accountId: account.accountId, serverId: account.serverId, result: false});
                }
            }));
        } else {
            const serverId = accounts.serverId;
            if (serverId != null) {
                return updateSettings({accountId: accounts.accountId, serverId});
            }
            return {accountId: accounts.accountId, serverId: accounts.serverId, result: false};
        }

        async function updateSettings(account: {accountId: number, serverId: string}):
        Promise<{accountId: number, serverId: string | undefined, result: boolean}> {
            let result: boolean = false;
            if (account.serverId !== undefined) {
                const server = VoliBotManager.getServerById(account.serverId);
                if (server !== undefined) {
                    result = await server.updateAccountSettings(account.accountId, settings);
                }
            }
            return {accountId: account.accountId, serverId: account.serverId, result};
        }
    }
}

export const Accounts = new AccountsManager();
