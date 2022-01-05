export class GameFormating{
    public static formatDisplayNumber(value:number) {
        return value.toLocaleString()
    }

    public static formatPostfix(value:number, curr:string = '€'){
        return value.toLocaleString()+curr
    }

    public static round(value:number, precision:number = 0){
        let prec = 1
        for(var i = 0; i < precision; i++){
            prec *= 10
        }

        return Math.round(value*prec)/prec
    }

    public static formatToRoundPostfix(value:number, precision:number = 2, postfix:string = '€'){
        return GameFormating.formatPostfix(GameFormating.round(value,precision),postfix)
    }

}