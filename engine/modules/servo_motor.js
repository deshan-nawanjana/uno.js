UNO.ServoMotor = class {

    constructor(controller, pin) {

        this.pin = pin || null

        // attach method
        this.attach = async function(pin) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.SVR_ATCH, resolve, reject, [pin || this.pin])
            })
        }

        // write method
        this.write = async function(angle) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.SVR_WRTE, resolve, reject, [angle])
            })
        }

    }

}