// pin mode constants
const OUTPUT = 0
const INPUT = 1
const INPUT_PULLUP = 2

// volt level constants
const HIGH = 1
const LOW = 0

// serial message categories
const CAT = {
    'CAT_CMMN' : 201, // common
    'CAT_SNSR' : 202, // sensors
    'CAT_MODS' : 203  // modules
}

// serial message methods under categories
const MTD = {
    'CAT_CMMN' : {
        'UJS_CLNT' : 0, // UNO.js client version
        'PIN_MODE' : 1, // pinMode()
        'PIN_STAT' : 2, // digitalRead(), analogRead()
        'DT_WRITE' : 3, // digitalWrite()
        'AL_WRITE' : 4, // analogWrite()
        'DLY_MLSC' : 5, // delay()
        'DLY_MRSC' : 6, // delayMicroseconds()
        'TIM_MLSC' : 7, // millis()
        'TIM_MRSC' : 8  // micros()
    },
    'CAT_SNSR' : {
        'USS_READ' : 0,  // unltrasonic pulseIn()
        'BPS_BEGN' : 10, // pressure.begin()
        'BPS_READ' : 11  // pressure.getTemperature(), pressure.getPressure()
    },
    'CAT_MODS' : {
        'SVR_ATCH' : 0,  // svr.attach()
        'SVR_WRTE' : 1,  // svr.write()
        'ACL_POWR' : 10, // adxl.powerOn()
        'ACL_READ' : 11, // adxl.readAccel()
        'LCD_BEGN' : 20, // lcd.begin()
        'LCD_CRSR' : 21, // lcd.setCursor()
        'LCD_PRNT' : 22, // lcd.print()
        'LCD_CLER' : 23  // lcd.clear()
    }
}

// color code by index method
const CLR = (i = 0) => {
    const colors = ['ff3300', '00cc99', '0066cc', '6666ff', 'ff66cc', 'ff9933']
    return '#' + colors[parseInt(i) % colors.length]
}

const UNO = {}

// main class
UNO.Controller = class {

    constructor() {

        // port object
        let port = null

        // current version
        const version = '1.1.22'

        // other versions
        const versions = ['1.0.22']

        // init method
        this.init = async function() {
            return new Promise((resolve, reject) => {
                // request usb port
                navigator.serial.requestPort().then(portObject => {
                    // set wait state
                    state.wait = true
                    // store port object
                    port = portObject
                    // opening port
                    port.open({ baudRate : 2000000 }).then(() => {
                        // get reader and writer
                        this.send.reader = port.readable.getReader()
                        this.send.writer = port.writable.getWriter()
                        // success request delay 
                        setTimeout(() => {
                            // request client version
                            this.init.getVersion().then(ver => {
                                if(ver === version) {
                                    // set running flag
                                    state.runs = true
                                    state.wait = false
                                    begin = false
                                    // callback resolve
                                    resolve()
                                } else if(versions.includes(ver)) {
                                    // version not mismatch
                                    console.warn('Please update the UNO.js client. System may not work properly.')
                                    console.log('Library : ' + version)
                                    console.log('Client  : ' + ver)
                                } else {
                                    reject('Oops! Seems like UNO.js client is not installed in your controller.\nDownload UNO.js client: https://github.com/deshan-nawanjana/uno.js/tree/main/client')
                                }
                            })
                        }, 3000)
                    })
                })
            })
        }

        // sender busy state
        let busy = false
        // need to stop state
        let needStop = false
        let needStopResolve = null

        this.send = async function(type, method, resolve, reject, data = []) {
            // check need stop
            if(needStop) {
                send.writer.releaseLock()
                send.reader.releaseLock()
                port.close()
                begin = true
                state.runs = false
                state.wait = null
                needStop = false
                needStopResolve()
                reject()
                return
            }
            // return if busy
            if(busy) { return reject() }
            // set busy flag
            busy = true
            // create array for buffer
            const array = [type, method].concat(data)
            // push end character
            array.push(255)
            // send message as buffer
            send.writer.write(new Uint8Array(array)).then(() => {
                // push to messages
                state.msgs.sent.push(array)
                // remove overflow messages
                if(state.msgs.sent.length === 9) { state.msgs.sent.shift() }
                // bytes remainder
                let remainder = []
                window.remainder = remainder
                // read loop until end character
                const readLoop = () => {
                    // read message
                    send.reader.read().then(obj => {
                        // get received bytes
                        const arr = Array.from(obj.value)
                        // combine with remainder
                        remainder = remainder.concat(arr)
                        // clear garbage in remainder
                        remainder = clearRemainder(remainder)
                        // get end character index
                        const end = remainder.indexOf(255)
                        // callback for completed message
                        if(end > -1) {
                            // get message from remainder
                            const data = remainder.splice(0, end)
                            // resolve callback
                            sendResolve(data, resolve)
                            // release busy flag
                            busy = false
                        } else {
                            // read loop again
                            readLoop()
                        }
                    }).catch(reject)
                }
                // start read loop
                readLoop()
            }).catch(reject)
        }

        // message categories array
        const starters = Object.values(CAT)
        // begin state flag
        let begin = true

        const clearRemainder = arr => {
            // begin check
            if(begin) {
                const idx = arr.lastIndexOf(201)
                // version check result in middle
                if(idx > -1 && arr[idx + 1] === 0) { return arr.splice(idx) }
                // no version check result yet
                if(idx === -1) { return [] }
            }

            // starter in first
            if(starters.includes(arr[0])) { return arr }
            // for each starters
            for(let i = 0; i < starters; i++) {
                const idx = arr.indexOf(starters[i])
                if(idx > -1) { return arr.splice(idx) }
            }
            // return empty
            return []
        }

        const sendResolve = (data, resolve) => {
            // push to messages
            state.msgs.received.push(JSON.parse(JSON.stringify(data)))
            // remove overflow messages
            if(state.msgs.received.length === 9) { state.msgs.received.shift() }
            // remove category code
            data.shift()
            // remove method code
            data.shift()
            // get digital states
            const digital = data.splice(0, data.indexOf(254) + 1)
            // get analog states
            const analog = data.splice(0, data.indexOf(254) + 1).map(x => parseInt(x * 5.115))
            // update digital pins
            state.pins.digital = digital.splice(0, digital.length - 1)
            // update analog pins
            state.pins.analog = analog.splice(0, analog.length - 1)
            // remove end character
            if(data[data.length - 1] === 255) { data.pop() }
            // callback resolve after updaing pin states
            resolve(data)
        }

        // get version method
        this.init.getVersion = async function() {
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.UJS_CLNT, arr => {
                    resolve(arr.splice(0, 3).join('.'))
                }, reject)
            })
        }

        // update pin states method
        this.update = async function() {
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.PIN_STAT, resolve, reject, [])
            })
        }

        // digital read method
        this.digitalRead = pin => {
            return state.pins.digital[pin]
        }

        // analog read method
        this.analogRead = pin => {
            return state.pins.analog[pin]
        }

        // pin format converter
        const convertPinFormat = (args, pars) => {
            // data object
            let data = typeof args[0] === 'object' ? args[0] : {}
            // check input mode
            if(args.length === 1) {
                // object mode
                pars.forEach(par => {
                    if(data[par] === undefined) { data[par] = [] }
                })
            } else {
                // single mode
                pars.forEach((par, idx) => {
                    if(args[1] === idx) {
                        data[par] = [ args[0] ]
                    } else {
                        data[par] = []
                    }
                })
            }
            // output array
            const out = []
            const irr = []
            // push other pins
            for(let i = 0; i < state.pins.digital.length; i++) {
                if(irr.includes(i) === false) {
                    pars.forEach((par, idx) => {
                            if(data[par].includes(i)) {
                                // set as input, output, input, input_pullup
                                out.push(idx)
                                irr.push(i)
                            }
                    })

                    if(irr.includes(i) === false) {
                        // no change to pin
                        out.push(253)
                        irr.push(i)
                    }
                }
            }
            // return output
            return out
        }

        // analog pin conveter method
        const convertPinFormatAnalog = args => {
            // data object
            let data = typeof args[0] === 'object' ? args[0] : {}
            // check arguments length
            if(args.length === 2) {
                data[args[0]] = args[1]
            }
            // output array
            const out = []
            // get keys array
            const krr = Object.keys(data).map(x => parseInt(x))
            // push other pins
            for(let i = 0; i < state.pins.digital.length; i++) {
                if(krr.includes(i)) {
                    // analog value in range 0  to 255 => 0 to 200
                    out.push(parseInt((data[i] > 255 ? 255 : data[i]) / 1.275))
                } else {
                    // no change to pin
                    out.push(253)
                }
            }
            // return output
            return out
        }

        // set pin mode method
        this.pinMode = async function() {
            // get pin format
            const data = convertPinFormat(arguments, ['OUTPUT', 'INPUT', 'INPUT_PULLUP'])
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.PIN_MODE, resolve, reject, data)
            })
        }

        // digital write method
        this.digitalWrite = async function() {
            // get pin format
            const data = convertPinFormat(arguments, ['LOW', 'HIGH'])
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.DT_WRITE, resolve, reject, data)
            })
        }

        // digital write method
        this.analogWrite = async function() {
            // get pin format
            const data = convertPinFormatAnalog(arguments)
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.AL_WRITE, resolve, reject, data)
            })
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        // delay method
        this.delay = async function(milliseconds) {
            // time input to buffer
            const data = Array.from(encoder.encode(milliseconds))
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.DLY_MLSC, resolve, reject, data)
            })
        }

        // delay method
        this.delayMicroseconds = async function(microseconds) {
            // time input to buffer
            const data = Array.from(encoder.encode(microseconds))
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.DLY_MRSC, resolve, reject, data)
            })
        }

        // millis method
        this.millis = async function() {
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.TIM_MLSC, arr => {
                    // decode and resolve
                    resolve(parseInt(decoder.decode(new Uint8Array(arr))))
                }, reject, [])
            })
        }

        // micros method
        this.micros = async function() {
            // return promise
            return new Promise((resolve, reject) => {
                send(CAT.CAT_CMMN, MTD.CAT_CMMN.TIM_MRSC, arr => {
                    // decode and resolve
                    resolve(parseInt(decoder.decode(new Uint8Array(arr))))
                }, reject, [])
            })
        }

        const send = this.send

        // controller state
        this._state = {
            pins : { digital : [], analog : [] },
            msgs : { sent : [], received : [] },
            runs : false, wait : null
        }

        // state class usage
        const state = this._state

        // disconnect callback
        navigator.serial.addEventListener('disconnect', event => {
            if(event.target === port) {
                state.runs = false
                state.wait = null
                begin = true
            }
        })

        this.stop = async function() {
            return new Promise(resolve => {
                needStop = true
                state.wait = true
                needStopResolve = resolve
            })
        }

    }

}