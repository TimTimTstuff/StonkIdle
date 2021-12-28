import LZString from 'lz-string';
import { GameSave } from './GameSave';

export class SaveManager {
    private _storageKey: string;
    private _saveObject: GameSave;

    public saveNotFound: (() => void) | undefined;
    public saveCorrupted: (() => void) | undefined;
    public saveCreated: (() => void) | undefined;
    public saveLoaded: (() => void) | undefined;
    
    constructor(saveName: string) {
        this._storageKey = saveName;
        this._saveObject = {lastSave: 0, saveVersion: "0.1", saveData: {}};
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
            
            if(this.saveLoaded != undefined)
                this.saveLoaded();

        } catch (ex) {
            this.saveCorruptedEvent();
        }
    }

    private saveCorruptedEvent() {
        if (this.saveCorrupted != undefined)
            this.saveCorrupted();
    }

    private saveNotFoundEvent() {
        if (this.saveNotFound != undefined)
            this.saveNotFound();
    }

}