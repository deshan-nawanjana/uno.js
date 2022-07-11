UNO.Accelerometer = class {

    constructor(controller) {

        this.powerOn = async function() {
            return controller.send('MD_1', 'ACL_POWR')
        }

        this.readAccel = async function() {
            return new Promise((resolve, reject) => {
                controller.send('MD_1', 'ACL_READ').then(arr => {
                    const out = _UNO_.HLP.decodeArray(arr, ['buffer', 'buffer', 'buffer'])
                    resolve({
                        x : parseInt(out[0]),
                        y : parseInt(out[1]),
                        z : parseInt(out[2])
                    })
                }).catch(reject)
            })
        }

    }

}