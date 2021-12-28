import { ILogger, LogLevel } from "../../module/logger/Logger";
import { IGameService } from "../IGameService";

export class LogService implements IGameService {
    public static serviceName = 'LogService';
    private _logger: ILogger;
    
    constructor(logger: ILogger) {
        this._logger = logger;
    }

    getServiceName(): string {
        return LogService.serviceName;
    }

    log(channel: string, msg: string, object?:unknown, level: LogLevel = LogLevel.Info): void {
        this._logger.log(channel, msg, object, level);
    }

    debug(channel: string, msg: string, object?:unknown): void {
        this._logger.debug(channel, msg, object);
    }

    info(channel: string, msg: string, object?:unknown): void{
        this._logger.info(channel, msg, object);
    }

    warn(channel: string, msg: string, object?:unknown): void{
        this._logger.warn(channel, msg, object);
    }

    error(channel: string, msg: string, object?:unknown): void{
        this._logger.error(channel, msg, object);
    }

    trace(channel: string, msg: string, object?:unknown): void{
        this._logger.trace(channel, msg, object);
    }
    
}