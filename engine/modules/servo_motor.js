UNO.ServoMotor = class {

    constructor(controller, pin) {

        this.pin = pin || null

        // attach method
        this.attach = async function(pin) {
            return new Promise((resolve, reject) => {
                controller.send(203, 0, resolve, reject, [pin || this.pin])
            })
        }

        // write method
        this.write = async function(angle) {
            return new Promise((resolve, reject) => {
                controller.send(203, 1, resolve, reject, [angle])
            })
        }

    }

}