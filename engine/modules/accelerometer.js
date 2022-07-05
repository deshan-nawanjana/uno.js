UNO.Accelerometer = class {

    constructor(controller) {

        this.powerOn = async function() {
            return new Promise((resolve, reject) => {
                controller.send(203, 10, resolve, reject, [])
            })
        }

        const decoder = new TextDecoder()

        this.readAccel = async function() {
            return new Promise((resolve, reject) => {
                controller.send(203, 11, arr => {
                    // get x value
                    const x = parseInt(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    arr.shift()
                    // get y value
                    const y = parseInt(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    arr.shift()
                    // get z value
                    const z = parseInt(decoder.decode(new Uint8Array(arr.splice(0, arr.indexOf(254)))))
                    resolve({ x : x, y : y, z : z })
                }, reject, [])
            })
        }

    }

}