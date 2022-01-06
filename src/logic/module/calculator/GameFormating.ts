export class GameFormating{
    public static formatDisplayNumber(value:number) {
        return value.toLocaleString()
    }

    public static formatPostfix(value:number, curr:string = '€', numberPrefix:boolean = false, precision:number = 0){
        return (numberPrefix&&value>0?'+':'')+value.toFixed(precision).toLocaleString()+curr
    }

    public static round(value:number, precision:number = 0){
        let prec = 1
        for(var i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.round(value*prec)/prec
    }

    public static formatToRound(value:number, precision:number = 2, numberPrefix:boolean = false):string {
        return (numberPrefix&&value>0?'+':'')+GameFormating.round(value,precision).toFixed(precision).toLocaleString()
    }

    public static formatToRoundPostfix(value:number, precision:number = 2, postfix:string = '€', numberPrefix:boolean = false):string{
        return GameFormating.formatPostfix(GameFormating.round(value,precision),postfix, numberPrefix, precision)
    }

}