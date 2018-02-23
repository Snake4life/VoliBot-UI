export class UrlWatcher {
    private interval: number;
    private lastData: string = "";
    private url: string;

    constructor(url: string, updateCheckIntervalMs: number) {
        this.url = url;
        this.interval = updateCheckIntervalMs;
        $.ajax({
            success : (result) => {
                this.lastData = result;
            },
            url : this.url,
        });
        setInterval(updateCheckIntervalMs);
    }

    forceCheck(): void {
        $.ajax({
            error: (_jqXHR, textStatus, errorThrown) => {
                // When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status
                if (this.onError !== undefined) {
                    this.onError(textStatus, errorThrown);
                }
            },
            success : (result) => {
                if (this.lastData !== result) {
                    this.lastData = result;
                    if (this.onNewData !== undefined) {
                        this.onNewData(result as string);
                    }
                }
            },
            url : this.url,
        });
    }

    onNewData: (newVersion: string) => void = () => { /* Do nothing */ };
    onError: (errorType: JQuery.Ajax.ErrorTextStatus | string, httpError: string) => void = () => { /* Do nothing */ };

    setInterval(updateCheckIntervalMs: number): void {
        if (this.interval !== undefined) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(this.forceCheck, updateCheckIntervalMs);
    }
}
