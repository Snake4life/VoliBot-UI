import AccountManager from 'Managers/AccountManager';
import VoliBotManager from 'Managers/VoliBotManager';

export default class Managers {
    static readonly AccountManager = new AccountManager();
    static readonly VoliBotManager = new VoliBotManager();
}