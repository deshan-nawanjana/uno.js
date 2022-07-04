const UNO = class {
    
    constructor() {

        // handler values
        this.port = null
        // running state flag
        this.running = false
        // supported versions
        const versions = ['1.0.0']

        // init method
        this.init = async function() {
            return new Promise(resolve => {
                // request usb port
                navigator.serial.requestPort().then(port => {
                    // store port
                    this.port = port
                    // opening port
                    port.open({ baudRate : 1000000 }).then(() => {
                        // success request delay 
                        setTimeout(() => {
                            // request client version
                            this.getVersion().then(ver => {
                                if(versions.includes(ver)) {
                                    // set running flag
                                    this.running = true
                                    // callback resolve
                                    resolve()
                                } else {
                                    // version not supported
                                    console.log('Please update the UNO.js Client.')
                                }
                            })
                            // start communication
                            communicate()
                        }, 3000)
                    })
                })
            })
        }

        // pin states
        const states = { digital : [], analog : [] }
        // pending requests
        let requests = []
        // bytes remainder
        let remainder = []

        this.states = states

        // communication method
        const communicate = () => {
            // get reader and writer
            const reader = uno.port.readable.getReader()
            const writer = uno.port.writable.getWriter()
            // loop method
            const loop = () => {
                // check for pending requests to send
                const req = requests.find(x => x.sent === false)
                // is any available request and no ongoing read
                if(req !== undefined && remainder.length === 0) {
                    // create array for bytes
                    const arr = [req.type].concat(req.data)
                    // push end character
                    arr.push(255)
                    //send message
                    writer.write(new Uint8Array(arr)).then(() => {
                        // mark as sent
                        req.sent = true
                        // loop again
                        requestAnimationFrame(loop)
                    })
                } else if(requests.find(x => x.sent === true)) {
                    // read for bytes
                    reader.read().then(obj => {
                        // get received bytes
                        const arr = Array.from(obj.value)
                        // combine with remainder
                        remainder = remainder.concat(arr)
                        // clearing remainder from overflows
                        clearRemainder()
                        // get any end character
                        const end = remainder.indexOf(255)
                        // callback for completed message
                        if(end > -1) {
                            // get message from remainder
                            const data = remainder.splice(0, end)
                            // clear remainder
                            remainder.splice(0, 1)
                            // test
                            callbackCommunication(data)
                        }
                        // loop again
                        requestAnimationFrame(loop)
                    })
                } else {
                    // loop again
                    requestAnimationFrame(loop)
                }
            }
            // start loop
            loop()
        }

        // request codes other than pin states
        let types = [201, 202, 204, 205]

        // clear remainder garbage
        const clearRemainder = () => {
            if(remainder.some(x => types.includes(x))) { return }
            if(remainder.indexOf(203) !== remainder.lastIndexOf(203)) {
                if(remainder.includes(255)) {
                    const index = remainder.lastIndexOf(255)
                    remainder.splice(0, index + 1)
                }
            }
        }

        // communication callback method
        const callbackCommunication = data => {
            // get message type
            const type = data.shift()
            // find matching request to resolve
            const req = requests.find(x => x.type === type)
            if(req) {
                // remove request from requests
                requests = requests.filter(x => x !== req)
                // callback resolve after updaing pin states
                req.resolve(extractPinStates(data))
            }
        }

        // pin state update method
        const extractPinStates = data => {
            // get digital states
            const digital = data.splice(0, data.indexOf(254) + 1)
            // get analog states
            const analog = data.splice(0, data.indexOf(254) + 1).map(x => parseInt(x * 5.12))
            // update digital pins
            states.digital = digital.splice(0, digital.length - 1)
            // update analog pins
            states.analog = analog.splice(0, analog.length - 1)
            // return rest result
            return data
        }

        // get version method
        this.getVersion = async function() {
            return new Promise(resolve => {
                requests.push({
                    type : 201,
                    data : [],
                    sent : false,
                    resolve : arr => {
                        resolve(arr.join('.'))
                    }
                })
            })
        }

        // digital read method
        this.digitalRead = pin => {
            return states.digital[pin]
        }

        // analog read method
        this.analogRead = pin => {
            return states.analog[pin]
        }

        // pin format converter
        const convertPinFormat = (args, par_1, par_2) => {
            // data object
            let data = typeof args[0] === 'object' ? args[0] : {}
            // check input mode
            if(args.length === 1) {
                // object mode
                if(data[par_1] === undefined) { data[par_1] = [] }
                if(data[par_2] === undefined) { data[par_2] = [] }
            } else {
                // single mode
                if(args[1] === 1) {
                    data[par_1] = [ args[0] ]
                    data[par_2] = []
                } else {
                    data[par_2] = [ args[0] ]
                    data[par_1] = []
                }
            }
            // output object
            const out = []
            // push other pins
            for(let i = 0; i < states.digital.length; i++) {
                if(data[par_1].includes(i)) {
                    // set as input, high pin
                    out.push(1)
                } else if(data[par_2].includes(i)) {
                    // set as output, low pin
                    out.push(0)
                } else {
                    // no change to pin
                    out.push(2)
                }
            }
            // return output
            return out
        }

        // set pin mode method
        this.pinMode = async function() {
            // get pin format
            const data = convertPinFormat(arguments, 'input', 'output')
            // return promise
            return new Promise(resolve => {
                requests.push({
                    type : 202,
                    data : data,
                    sent : false,
                    resolve : resolve
                })
            })
        }

        // digital write method
        this.digitalWrite = async function() {
            // get pin format
            const data = convertPinFormat(arguments, 'high', 'low')
            // return promise
            return new Promise(resolve => {
                requests.push({
                    type : 204,
                    data : data,
                    sent : false,
                    resolve : resolve
                })
            })
        }

    }

}

const OUTPUT = 0
const INPUT = 1

const HIGH = 1
const LOW = 0