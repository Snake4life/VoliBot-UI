import { IManager } from "./IManager";

class LogItem {
    time: Date;
    data: string;
    level: LogLevel;
    stack: string;
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

    toJson(): string{
        return JSON.stringify(this.logs, null, "\t");
    }

    debug(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data.toString(),
            time: new Date()
        } as LogItem);
        console.debug(data);
    }

    info(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data.toString(),
            time: new Date()
        } as LogItem);
        console.info(data);
    }

    warn(data: any){
        this.logs.push({
            level: LogLevel.Debugging,
            data: data.toString(),
            time: new Date()
        } as LogItem);
        console.warn(data);
    }

    error(message: string, error: Error = new Error()){
        this.logs.push({
            level: LogLevel.Debugging,
            data: message + error.message.toString(),
            time: new Date(),
            stack: error.stack
        } as LogItem);
        console.error(`${message}: ${error.message} `);
    }
}

export var Log = new LogManager();