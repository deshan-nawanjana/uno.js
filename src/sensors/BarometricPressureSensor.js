UNO.BarometricPressureSensor = class {

    constructor(controller, defaultAltitude = 840.0) {

        this.defaultAltitude = defaultAltitude

        this.begin = async function() {
            return controller.send('SN_1', 'BPS_BEGN')
        }

        this.read = async function(altitude) {
            const alt = altitude !== undefined ? altitude : this.defaultAltitude
            const dat = _UNO_.HLP.encodeText(alt)
            return new Promise((resolve, reject) => {
                controller.send('SN_1', 'BPS_READ', dat).then(arr => {
                    const out = _UNO_.HLP.decodeArray(arr, ['buffer', 'buffer', 'buffer'])
                    resolve({
                        temperature : parseFloat(out[0]),
                        pressure : parseFloat(out[1]),
                        relativePressure : parseFloat(out[2])
                    })
                }).catch(reject)
            })
        }
        
    }

}