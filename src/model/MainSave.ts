import { Business } from "./Business";

export interface MainSave{
    ticks:number;   
    name: string;
    lastSave:Date; 
    business:Business[];
}
