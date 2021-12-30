
import { Potential } from "../../../model/Business";
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
    private static instance: SaveDataService;

    constructor(autosaveSeconds: number) {

        if(SaveDataService.instance != undefined)
            throw new Error(`Instance already exists`)

        SaveDataService.instance = this;
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

    public static getInstance(autosave:number) {
        if(this.instance === undefined)
            this.instance = new SaveDataService(autosave)
        return this.instance
    }

    public getGameSave(): MainSave {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        let ms: MainSave = <MainSave>this._saveManager.getSaveObject('mainsave')
        if (ms === undefined) {
            ms = {
                name: 'unknown',
                lastSave: new Date(),
                ticks: 0,
                business:[],
                marketPotential:Potential.High,
                player:{
                    depots:[],
                    mainAccount:{balance: 1000, id:'main', interest:0,interestForPeriods:0,isSaving:false,name:'Bank Account'},
                    savingAccount:{balance: 100000, id:'saving', interest:3.4, interestForPeriods:900000, name:'Saving Account', isSaving:true},
                }
            
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