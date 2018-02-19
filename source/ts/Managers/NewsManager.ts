import { IManager } from "./IManager";
import { Notifications, Log } from "./";
import anime from 'animejs';
import * as $ from 'jquery';

export class NewsManager implements IManager{
    initialize(): void {
        this.updateWatcher.forceCheck();
        this.newsWatcher.forceCheck();
    }

    updateWatcher: UrlWatcher;
    newsWatcher: UrlWatcher;

    constructor(updateInterval: number){
        this.updateWatcher = new UrlWatcher("/build-date.txt", updateInterval);
        this.newsWatcher = new UrlWatcher("/news.json", updateInterval);0
        
        this.updateWatcher.onNewData = this.displayUpdate;
        this.newsWatcher.onNewData = this.displayNews;

        this.updateWatcher.onError = (textStatus, errorThrown) => {
            Log.warn(`Failed to check for updates: ${textStatus}|${errorThrown}`);
            Notifications.addNotification("updateWatcherOnError", "Failed to check for updates.", `Retrying in ${updateInterval/1000} seconds.`);
        }
        this.newsWatcher.onError = () => {
            Notifications.addNotification("newsWatcherOnError", "Failed to retrieve news.", `Retrying in ${updateInterval/1000} seconds.`);
        }
    }

    displayNews(){
        //TODO: Add a "news" component, then register that instance here somehow.
    }

    displayUpdate(data: string){
        let visual_date = / (.*) GMT/.exec(data)[1];
        Notifications.addNotification("uiVersionUpdate", `There's a UI update available! (${visual_date})`, "Click here to update.<br>(The VoliBot Core will not restart)");
    }
}

class UrlWatcher{
    private lastData: string;
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
            error: (jqXHR, textStatus, errorThrown) => {
                // When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status
                if (this.onError != undefined)
                    this.onError(textStatus, errorThrown);
            }
        });
    }

    onNewData: (newVersion: string) => void;
    onError: (errorType: JQuery.Ajax.ErrorTextStatus | string, httpError: string) => void;

    setInterval(updateCheckIntervalSeconds: number){
        if (this.interval != undefined)
            clearInterval(this.interval);
        this.interval = setInterval(this.forceCheck, updateCheckIntervalSeconds);
    }

    private interval: number;
    constructor(url: string, updateCheckIntervalSeconds: number){
        $.ajax({
            url : this.url,
            success : (result) => {
                this.lastData = result;
            }
        });
        setInterval(updateCheckIntervalSeconds);
    }
}