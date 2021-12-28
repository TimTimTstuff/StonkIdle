
import { MainSave } from "../../../model/MainSave";
import { SaveManager } from "../../module/saveManager/SaveManager";
import { GlobalEvents } from "../eventHandler/GlobalEventService";
import { GameServices } from "../GameServices";
import { IGameService } from "../IGameService";



export class SaveDataService implements IGameService {

    private _saveManager: SaveManager;
    private _autosaveSeconds = 30;
    //private _saveLoopId: number;
    public static serviceName = 'SaveDataService';

    constructor(autosaveSeconds: number) {
        this._saveManager = new SaveManager('tgame');
        this._saveManager.initializeSave();
        this._saveManager.saveNotFound = () => {
            this._saveManager.saveFile();
        }

        this._saveManager.saveCreated = () => {
            //saved!
        }
        if (autosaveSeconds !== 0) {
            //this._saveLoopId = 
            window.setInterval(
                () => {
                    GameServices.getService<GlobalEvents>(GlobalEvents.serviceName).callEvent('autosave', this, null)
                    this._saveManager.saveFile()
                },
                this._autosaveSeconds * 1000)
        }
    }

    public getGameSave(): MainSave {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        let ms: MainSave = <MainSave>this._saveManager.getSaveObject('mainsave')
        if (ms === undefined) {
            ms = {
                name: 'unknown',
                lastSave: new Date(),
                ticks: 0,
                business:[]
            }
            this._saveManager.addSaveObject('mainsave', ms)
        }

        return ms
    }

    public getSaveObject(): unknown {
        return this._saveManager.getSaveFile();
    }

    public getServiceName(): string {
        return SaveDataService.serviceName;
    }

    public resetSave(): void {
        this._saveManager.wipeSave();
        window.location.reload();
    }

    public save(): void {
        this._saveManager.saveFile();
    }
}