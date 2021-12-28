import { PlayerSave } from './AccountData'
import { Business } from './Business'
export interface MainSave {
    ticks: number
    name: string
    lastSave: Date
    business: Business[]
    player: PlayerSave
}
