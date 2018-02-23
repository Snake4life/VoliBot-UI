import { LogLevel } from "./LogLevel";

export class LogItem {
    time: Date;
    data: string;
    level: LogLevel;
    stack: string | undefined;

    constructor(time: Date, data: string, level: LogLevel, stack?: string) {
        this.time = time;
        this.data = data;
        this.level = level;
        this.stack = stack;
    }
}
