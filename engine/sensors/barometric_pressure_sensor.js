UNO.BarometricPressureSensor = class {

    constructor(controller, defaultAltitude = 840.0) {

        this.defaultAltitude = defaultAltitude

        this.begin = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_SNSR, MTD.CAT_SNSR.BPS_BEGN, resolve, reject, [])
            })
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        this.read = async function(altitude) {
            const alt = altitude !== undefined ? altitude : this.defaultAltitude
            const data = Array.from(encoder.encode(alt))
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_SNSR, MTD.CAT_SNSR.BPS_READ, arr => {
                    // get temperature
                    const tmp = parseFloat(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    arr.shift()
                    // get pressure
                    const psr = parseFloat(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    arr.shift()
                    // get relative pressure
                    const prr = parseFloat(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    resolve({
                        temperature : tmp,
                        pressure : psr,
                        relativePressure : prr
                    })
                }, reject, data)
            })
        }
        
    }

}