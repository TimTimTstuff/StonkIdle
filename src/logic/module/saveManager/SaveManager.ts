import LZString from 'lz-string';
import { MainSave } from '../../../model/MainSave';
import { GameConfig } from '../../services/Config';
import { GameSave } from './GameSave';
import { SaveFileCleaner } from './SaveFileCleaner';


export class SaveManager {
    private _storageKey: string;
    private _saveObject: GameSave;

    public saveNotFound: (() => void) | undefined;
    public saveCorrupted: (() => void) | undefined;
    public saveCreated: (() => void) | undefined;
    public saveLoaded: (() => void) | undefined;

    constructor(saveName: string) {
        this._storageKey = saveName;
        this._saveObject = {lastSave: 0, saveVersion: GameConfig.saveVersion, saveData: {}};
        (window as any)['sig'] = ()=>{return this._saveObject}
    }

    public  getSaveFile(): unknown {
        return this._saveObject;
    }
    
    public getSaveObject(key:string): unknown {
        return this._saveObject.saveData[key];
    }

    public addSaveObject(key:string, data:unknown): void {
        this._saveObject.saveData[key] = data;
    }

    public initializeSave(): void {
        this.loadSaveData();
    }

    public wipeSave(): void {
        localStorage.removeItem(this._storageKey);
    }

    public saveFile(): void {
        this._saveObject.lastSave = Date.now();
        
        const file = JSON.stringify(this._saveObject);
        const compress = LZString.compressToBase64(file);
        localStorage.setItem(this._storageKey, compress);
        if(this.saveCreated !== undefined)
            this.saveCreated();
    }

    private loadSaveData() {
        try {
            const saveLs = localStorage.getItem(this._storageKey);
            if (saveLs == null) {
                this.saveNotFoundEvent();
                return;
            }

            const decodedSave = LZString.decompressFromBase64(saveLs);
            if (decodedSave == null) {
                this.saveCorruptedEvent();
                return;
            }

            this._saveObject = JSON.parse(decodedSave);
            if(this._saveObject.saveVersion !== GameConfig.saveVersion){
                alert('Game has new Save Version. Try to migrate Save. ')
                SaveFileCleaner.update_04(this.getSaveObject('mainsave') as MainSave)
                //this.resetSave()
                this._saveObject.saveVersion = GameConfig.saveVersion
                
            }
            if(this.saveLoaded !== undefined)
                this.saveLoaded();

        } catch (ex) {
            this.saveCorruptedEvent();
            this.resetSave();
        }
    }

    private resetSave() {
        localStorage.setItem('bak_save', localStorage.getItem(this._storageKey) as string);
        alert(`Save not Compatible with the current build. Created backup. New save started \n-------- Old Save (or in Application)\n ${localStorage.getItem('bak_save')}`)
        localStorage.removeItem(this._storageKey);
    }

    private saveCorruptedEvent() {
        if (this.saveCorrupted !== undefined)
            this.saveCorrupted();
    }

    private saveNotFoundEvent() {
        if (this.saveNotFound !== undefined)
            this.saveNotFound();
    }

}