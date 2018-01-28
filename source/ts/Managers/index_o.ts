import { VoliBotManager } from './VoliBotManager';
import { AccountManager } from './AccountManager';
import { SettingsManager } from './SettingsManager';
import { NotificationManager } from './NotificationManager';
import { LogManager } from './LogManager';
import { UiManager } from './UiManager';
import { IManager } from './';

export class Managers {
    static readonly NotificationManager = new NotificationManager();
    static readonly VoliBotManager = new VoliBotManager();
    static readonly AccountManager = new AccountManager();
    static readonly SettingsManager = new SettingsManager();
    static readonly UiManager = new UiManager();
    static readonly LogManager = new LogManager();

    static initialize() {
        ([
            this.NotificationManager,
            this.SettingsManager,            
            this.VoliBotManager,
            this.AccountManager,
            this.LogManager,
            this.UiManager,
        ] as IManager[])
        .forEach(x => {
                x.initialize();
            }
        );
    }
}