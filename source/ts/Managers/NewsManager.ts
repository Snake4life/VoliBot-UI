import { IManager } from "./IManager";
import { Notifications, Log } from "./";
import * as $ from 'jquery';

export class NewsManager implements IManager{
    initialize(): void {
        this.updateWatcher.forceCheck();
        this.newsWatcher.forceCheck();
    }

    updateWatcher: UrlWatcher;
    newsWatcher: UrlWatcher;

    constructor(updateIntervalMs: number){
        this.updateWatcher = new UrlWatcher("/build-date.txt", updateIntervalMs);
        this.newsWatcher = new UrlWatcher("/news.json", updateIntervalMs);
        
        this.updateWatcher.onNewData = this.displayUpdate;
        this.newsWatcher.onNewData = this.displayNews;

        this.updateWatcher.onError = (textStatus, errorThrown) => {
            Log.warn(`Failed to check for updates: ${textStatus}|${errorThrown}`);
            Notifications.addNotification("updateWatcherOnError", "Failed to check for updates.", `Retrying in ${updateIntervalMs/1000} seconds.`);
        }
        this.newsWatcher.onError = () => {
            Notifications.addNotification("newsWatcherOnError", "Failed to retrieve news.", `Retrying in ${updateIntervalMs/1000} seconds.`);
        }
    }

    displayNews(){
        //TODO: Add a "news" component, then register that instance here somehow.
    }

    displayUpdate(date: string){
        let regex = / (.*) GMT/.exec(date);
        let visual_date: string = (regex == null) ? "Unknown" : regex[1];
        Notifications.addNotification("uiVersionUpdate", `There's a UI update available! (${visual_date})`, "Click here to update.<br>(The VoliBot Core will not restart)");
    }
}

export class UrlWatcher{
    private lastData: string = "";
    private url: string;

    forceCheck(){
        $.ajax({
            url : this.url,
            success : (result) => {
                if (this.lastData != result){
                    this.lastData = result;
                    if (this.onNewData != undefined)
                        this.onNewData(result as string);
                }
            },
            error: (_jqXHR, textStatus, errorThrown) => {
                // When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status
                if (this.onError != undefined)
                    this.onError(textStatus, errorThrown);
            }
        });
    }

    onNewData: (newVersion: string) => void = () => {};
    onError: (errorType: JQuery.Ajax.ErrorTextStatus | string, httpError: string) => void = () => {};

    setInterval(updateCheckIntervalMs: number){
        if (this.interval != undefined)
            clearInterval(this.interval);
        this.interval = setInterval(this.forceCheck, updateCheckIntervalMs);
    }

    private interval: number;
    constructor(url: string, updateCheckIntervalMs: number){
        this.url = url;
        this.interval = updateCheckIntervalMs;
        $.ajax({
            url : this.url,
            success : (result) => {
                this.lastData = result;
            }
        });
        setInterval(updateCheckIntervalMs);
    }
}

export var News = new NewsManager(10 * 1000);