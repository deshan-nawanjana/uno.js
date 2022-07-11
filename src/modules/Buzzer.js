UNO.Buzzer = class {

    constructor(controller, pin) {
        
        this.playTone = async function(toneArray, count = 1) {
            for(let r = 0; r < Math.abs(count); r++) {
                for(let i = 0; i < toneArray.length; i++) {
                    await controller.tone(pin, toneArray[i].frequency)
                    await controller.delay(toneArray[i].duration)
                }
            }
            await controller.noTone(pin)
        }

    }

}