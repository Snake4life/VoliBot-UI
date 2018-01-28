import { IManager } from "./IManager";

export class LogManager implements IManager {
    initialize() {
        let log = function() {
            console.log(arguments);
            return Function.prototype.bind.call(console.log, console);
        }();

        log("This is a test");
        log("Test2!");
        log("Test3!");

        //var Debugger = function(gState, klass) {
        //    this.debug = {}
        //    if (gState && klass.isDebug) {
        //      for (var m in console)
        //        if (typeof console[m] == 'function')
        //          this.debug[m] = console[m].bind(window.console, klass.toString()+": ")
        //    }else{
        //      for (var m in console)
        //        if (typeof console[m] == 'function')
        //          this.debug[m] = function(){}
        //    }
        //    return this.debug
        //}
    }
}

export var Log = new LogManager();

/*
class LogItem {
    logTime: Date;
    logData: any;
}*/