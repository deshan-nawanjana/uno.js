UNO.UltrasonicSensor = class {

    constructor(controller, triggerPin, echoPin) {

        // init method
        this.init = async function() {
            // pinmode for tigger and echo pins
            return controller.pinMode({
                OUTPUT : [triggerPin],
                INPUT : [echoPin]
            })
        }

        const decoder = new TextDecoder()

        // read method
        this.read = async function() {
            return new Promise((resolve, reject) => {
                controller.send(202, 0, arr => {
                    // decode and resolve
                    resolve(parseInt(decoder.decode(new Uint8Array(arr))))
                }, reject, [triggerPin, echoPin])
            })
        }

    }

}