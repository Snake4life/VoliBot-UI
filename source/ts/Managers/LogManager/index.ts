import { Manager } from "../Manager";
import { LogItem } from "./LogItem";
import { LogLevel } from "./LogLevel";

export class LogManager extends Manager {
    private logs: LogItem[] = new Array<LogItem>();

    toJson(): string {
        return JSON.stringify(this.logs, null, "\t");
    }

    debug(data: any) {
        this.logs.push(new LogItem(
            new Date(),
            JSON.stringify(data),
            LogLevel.Debugging,
        ));
        // tslint:disable-next-line:no-console
        console.debug(data);
    }

    info(data: any) {
        this.logs.push(new LogItem(
            new Date(),
            JSON.stringify(data),
            LogLevel.Info,
        ));
        // tslint:disable-next-line:no-console
        console.info(data);
    }

    warn(data: any) {
        this.logs.push(new LogItem(
            new Date(),
            JSON.stringify(data),
            LogLevel.Warning,
        ));
        // tslint:disable-next-line:no-console
        console.warn(data);
    }

    error(message: string, error: Error = new Error()) {
        this.logs.push(new LogItem(
            new Date(),
            message + error.message.toString(),
            LogLevel.Error,
            error.stack,
        ));
        // tslint:disable-next-line:no-console
        console.error(`${message}: ${error.message} `);
    }
}

export const Log = new LogManager();
