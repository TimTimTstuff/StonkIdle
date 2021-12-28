export enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}

export interface ILogger {
    log(channel: string, msg: string, object?: unknown, level?: LogLevel): void;
    debug(channel: string, msg: unknown, object?: unknown): void;
    info(channel: string, msg: unknown, object?: unknown): void;
    warn(channel: string, msg: unknown, object?: unknown): void;
    error(channel: string, msg: unknown, object?: unknown): void;
    trace(channel: string, msg: unknown, object?: unknown): void;
}

export class ConsoleLogger implements ILogger {


    private _channelList: { [index: string]: boolean } = {};
    private _logLevel = 1;
    private _defaultActive = true;
    private _useConsoleLevel = true;

    constructor(logLevel: LogLevel = LogLevel.Info, channelsDefaultActive = false, useConsoleLevel = true) {
        this._logLevel = logLevel;
        this._defaultActive = channelsDefaultActive;
        this._useConsoleLevel = useConsoleLevel;
        this._channelList = {};
    }

    setUseConsoleLevel(use: boolean): void {
        this._useConsoleLevel = use;
    }

    setChannelsDefaultActive(defaultChannel: boolean): void {
        this._defaultActive = defaultChannel;
    }

    setLogLevel(logLevel: LogLevel): void {
        this._logLevel = logLevel;
    }

    setChannelActive(channel: string, active: boolean): void {
        this._channelList[channel] = active;
    }

    getLoggerInfo(): { logLevel: LogLevel, defaultActive: boolean, useConsoleLevel: boolean, channelList: { [index: string]: boolean } } {
        return { channelList: this._channelList, defaultActive: this._defaultActive, useConsoleLevel: this._useConsoleLevel, logLevel: this._logLevel };
    }

    log(channel: string, msg: string, object?: unknown, level: LogLevel = LogLevel.Info): void {
        if (this._channelList[channel] === undefined)
            this._channelList[channel] = this._defaultActive;

        if (level >= this._logLevel) {
            const logMsg = `${channel} - ${msg}`;
            if (this._useConsoleLevel) {
                switch (level) {
                    case LogLevel.Debug:
                        console.log(logMsg);
                        if(object !== undefined) console.log(object);
                        break;
                    case LogLevel.Info:
                        console.info(logMsg);
                        if(object !== undefined) console.log(object);
                        break;
                    case LogLevel.Warn:
                        console.warn(logMsg);
                        if(object !== undefined) console.log(object);
                        break;
                    case LogLevel.Error:
                        console.error(logMsg);
                        if(object !== undefined) console.log(object);
                        break;
                    case LogLevel.Trace:
                        console.trace(logMsg);
                        if(object !== undefined) console.log(object);
                        break;
                }
            } else {
                const logMsg = `${LogLevel[level]}: ${channel} - ${msg}`;
                console.log(logMsg);
                if(object !== undefined) console.log(object);
            }
        }
    }
    debug(channel: string, msg: string, object?:unknown): void {
        this.log(channel, msg, object, LogLevel.Debug);
    }
    info(channel: string, msg: string, object?:unknown): void {
        this.log(channel, msg, object, LogLevel.Info);
    }
    warn(channel: string, msg: string, object?:unknown): void {
        this.log(channel, msg, object, LogLevel.Warn);
    }
    error(channel: string, msg: string, object?:unknown): void {
        this.log(channel, msg, object, LogLevel.Error);
    }
    trace(channel: string, msg: string, object?:unknown): void {
        this.log(channel, msg, object, LogLevel.Trace);
    }

}