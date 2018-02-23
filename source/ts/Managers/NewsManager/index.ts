import { Log, Notifications, UI } from "../";
import { Manager } from "../Manager";
import { UrlWatcher } from "./UrlWatcher";

export class NewsManager extends Manager {
    newsWatcher: UrlWatcher;
    updateWatcher: UrlWatcher;

    constructor(updateIntervalMs: number) {
        super();
        this.updateWatcher = new UrlWatcher("/build-date.txt", updateIntervalMs);
        this.newsWatcher = new UrlWatcher("/news.json", updateIntervalMs);
        this.updateWatcher.onNewData = this.displayUpdate;
        this.newsWatcher.onNewData = this.displayNews;

        this.updateWatcher.onError = (textStatus, errorThrown) => {
            Log.warn(`Failed to check for updates: ${textStatus}|${errorThrown}`);
            Notifications.addNotification(
                "updateWatcherOnError",
                "Failed to check for updates.",
                `Retrying in ${updateIntervalMs / 1000} seconds.`,
            );
        };
        this.newsWatcher.onError = (textStatus, errorThrown) => {
            Log.warn(`Failed to check for news: ${textStatus}|${errorThrown}`);
            Notifications.addNotification(
                "newsWatcherOnError",
                "Failed to retrieve news.",
                `Retrying in ${updateIntervalMs / 1000} seconds.`,
                undefined,
                undefined,
                "fas fa-exclamation-triangle",
            );
        };
    }

    initialize(): void {
        this.updateWatcher.forceCheck();
        this.newsWatcher.forceCheck();
    }

    displayNews(): void {
        //TODO: Add a "news" component, then register that instance here somehow.
    }

    displayUpdate(_date: string): void {
        Notifications.addNotification(
            "uiVersionUpdate",
            "There's a UI update available!",
            "Click here to update!",
            undefined,
            () => {
                UI.displayGoodbye = false;
                UI.setCurrentScreen("None");
                Notifications.closeNotification("uiVersionUpdate", () => {
                    window.location.reload(true);
                });
            },
        );
    }
}

export const News: NewsManager = new NewsManager(10 * 1000);
