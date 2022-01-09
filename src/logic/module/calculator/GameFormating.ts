export class GameFormating{
    public static formatDisplayNumber(value:number) {
        return value.toLocaleString()
    }

    public static formatPostfix(value:number, curr:string = '€', numberPrefix:boolean = false, precision:number = 0){
        if(isNaN(value)) value = 0
        return (numberPrefix&&value>0?'+':'')+value.toLocaleString('en-US',{maximumFractionDigits:precision})+curr
    }

    public static round(value:number, precision:number = 0){
        if(isNaN(value)) value = 0
        let prec = 1
        for(var i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.round(value*prec)/prec
    }

    public static roundDown(value:number, precision:number = 0){
        if(isNaN(value)) value = 0
        let prec = 1
        for(var i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.floor(value*prec)/prec
    }

    public static roundUp(value:number, precision:number = 0){
        if(isNaN(value)) value = 0
        let prec = 1
        for(var i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.ceil(value*prec)/prec
    }

    public static formatToRound(value:number, precision:number = 2, numberPrefix:boolean = false):string {
        return (numberPrefix&&value>0?'+':'')+GameFormating.round(value,precision).toLocaleString('en-US',{maximumFractionDigits:precision})
    }

    public static formatToRoundPostfix(value:number, precision:number = 2, postfix:string = '€', numberPrefix:boolean = false):string{
        return GameFormating.formatPostfix(GameFormating.round(value,precision),postfix, numberPrefix, precision)
    }

}