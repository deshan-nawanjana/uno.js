UNO.UltrasonicSensor = class {

    constructor(controller, triggerPin, echoPin) {

        this.begin = async function() {
            return controller.pinMode({
                OUTPUT : [triggerPin],
                INPUT : [echoPin]
            })
        }

        this.readDuration = async function() {
            return new Promise((resolve, reject) => {
                controller.send('SN_1', 'USS_READ', [triggerPin, echoPin]).then(arr => {
                    const value = _UNO_.HLP.decodeText(arr[0])
                    resolve(parseFloat(value))
                }).catch(reject)
            })
        }

    }

}