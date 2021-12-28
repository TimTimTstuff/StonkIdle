export interface GameSave {
    saveVersion:string;
    lastSave:number;
    saveData:{[index:string]:unknown};
}