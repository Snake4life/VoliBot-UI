import { IManager } from "./IManager";

class LogItem {
    time: Date;
    data: any;
    level: LogLevel;
}

export enum LogLevel{
    Debugging,
    Info,
    Warning,
    Error
}

export class LogManager implements IManager {
    private logs: LogItem[] = new Array<LogItem>();
    initialize() {

    }

    debug(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data,
            time: new Date()
        } as LogItem);
        console.debug(data);
    }
    info(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data,
            time: new Date()
        } as LogItem);
        console.info(data);
    }
    warn(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data,
            time: new Date()
        } as LogItem);
        console.warn(data);
    }
    error(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data,
            time: new Date()
        } as LogItem);
        console.error(data);
    }
}

export var Log = new LogManager();