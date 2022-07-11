UNO.Controller = class {

    constructor() {

        // serial port object
        let port = null
        // communication busy state
        let busy = false
        // waiting to stop details
        let stop = { pending : false, resolve : null }

        // init method
        this.init = async function(portObject) {
            return new Promise((resolve, reject) => {
                // port open method
                const openPort = portObject => {
                    // store port
                    port = portObject
                    // update wait flag
                    state.wait = true
                    // opening port
                    port.open({ baudRate : 2000000 }).then(() => {
                        // get reader and writer
                        send.reader = port.readable.getReader()
                        send.writer = port.writable.getWriter()
                        // delay to flush
                        setTimeout(() => {
                            // check version
                            checkVersion(() => {
                                // set state flags
                                state.runs = true
                                state.wait = false
                                // init completed
                                resolve()
                            }, reject)
                        }, 3000)
                        // port open fails
                    }).catch(reject)
                }
                // check default port
                if(portObject) {
                    openPort(portObject)
                } else {
                    navigator.serial.requestPort().then(openPort).catch((reject))
                }
            })
        }

        // send method
        this.send = async function(type, method, data) {
            return new Promise((resolve, reject) => {
                if(stop.pending) {
                    // terminate check
                    terminateSession(reject)
                } else if(busy) {
                    // reject if busy
                    reject()
                } else {
                    // set busy flag
                    busy = true
                    // create data array
                    const array = createMessage(type, method, data)
                    // create buffer array
                    const buffer = new Uint8Array(array)
                    // send message
                    send.writer.write(buffer).then(() => {
                        // add to history
                        createHistory(array, 'sent')
                        // bytes remainder
                        let remainder = []
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
                                const end = remainder.indexOf(MSG.END)
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
            })
        }

        const clearRemainder = array => {
            // check for sent messages
            if(state.msgs.sent.length > 0) {
                // get last message
                const msg = state.msgs.sent[state.msgs.sent.length - 1]
                // check for version check
                if(msg[0] === MSG.UNJS.CODE && msg[1] === MSG.UNJS.VER_CLNT) {
                    if(array.includes(MSG.UNJS.CODE)) {
                        return array.splice(array.indexOf(MSG.UNJS.CODE))
                    } else { return [] }
                } else { return array }
            } else { return array }
        }

        const sendResolve = (message, resolve) => {
            // add to history
            createHistory(message, 'received')
            // get data from message
            const data = splitMessage(message)
            // update digital pin states
            state.pins.digital = data[0]
            // update analog pin states
            state.pins.analog = data[1]
            // resolve requesed data
            resolve(data.splice(2))
        }

        const createMessage = (type, method, data = []) => {
            // create array
            const array = [MSG[type].CODE, MSG[type][method]].concat(data)
            // push end character
            array.push(MSG.END)
            // return array
            return array
        }

        const splitMessage = array => {
            // remove type and method
            array.splice(0, 2)
            // output array
            const out = []
            // while includes separator
            while(array.includes(MSG.SPR)) {
                // push data
                out.push(array.splice(0, array.indexOf(MSG.SPR)))
                // remove separator
                array.shift()
            }
            // return out
            return out
        }

        const createHistory = (message, type) => {
            // clone message
            const msg = JSON.parse(JSON.stringify(message))
            // get message section
            const arr = state.msgs[type]
            // add to history
            arr.push(msg)
            // remove overflow
            if(arr.length === 9) { arr.shift() }
        }

        const terminateSession = reject => {
            // release locks
            send.writer.releaseLock()
            send.reader.releaseLock()
            // close port
            port.close()
            // update state
            state.runs = false
            state.wait = null
            stop.pending = false
            // reject last request
            reject()
            // resolve terminate
            if(stop.resolve) { stop.resolve() }
        }

        const checkVersion = (resolve, reject) => {
            // request client version
            send('UNJS', 'VER_CLNT').then(arr => {
                // client version
                const version = arr[0].join('.')
                // check version
                if(VER.CRR === version) {
                    // version matched
                    resolve()
                } else if(VER.OLD.includes(version)) {
                    // version mismatched
                    console.warn(LOG.VER)
                    resolve()
                } else {
                    // no client
                    reject(LOG.NOT)
                }
            }).catch(reject)
        }

        this.pinMode = async function() {
            const data = HLP.keyGroup(arguments, ['OUTPUT', 'INPUT', 'INPUT_PULLUP'])
            return send('BLTN', 'PIN_MODE', data)
        }

        this.digitalWrite = async function() {
            const data = HLP.keyGroup(arguments, ['LOW', 'HIGH'])
            return send('BLTN', 'DT_WRITE', data)
        }

        this.analogWrite = async function() {
            const data = HLP.typeGroup(arguments, [1, 0.7843137254901961])
            return send('BLTN', 'AL_WRITE', data)
        }

        this.digitalRead = pin => {
            return state.pins.digital[pin]
        }

        this.analogRead = pin => {
            return state.pins.analog[pin]
        }

        this.delay = async function(time) {
            return send('BLTN', 'DLY_MLSC', HLP.encodeText(time))
        }

        this.delayMicroseconds = async function(time) {
            return send('BLTN', 'DLY_MRSC', HLP.encodeText(time))
        }

        this.millis = async function() {
            return new Promise((resolve, reject) => {
                send('BLTN', 'TIM_MLSC').then(arr => {
                    resolve(parseInt(HLP.decodeText(arr[0])))
                }).catch(reject)
            })
        }

        this.micros = async function() {
            return new Promise((resolve, reject) => {
                send('BLTN', 'TIM_MRSC').then(arr => {
                    resolve(parseInt(HLP.decodeText(arr[0])))
                }).catch(reject)
            })
        }

        this.tone = async function(pin, frequency, duration) {
            let format
            if(duration === undefined) {
                // no duration provided
                format = [1, 'buffer', 1]
                duration = MSG.NTR
            } else {
                // duration provided
                format = [1, 'buffer', 'buffer']
            }
            const data = HLP.encodeArray([pin, frequency, duration], format)
            return send('BLTN', 'ADV_TONE', data)
        }

        this.noTone = async function(pin) {
            return send('BLTN', 'ADV_NOTN', [pin])
        }

        this.stop = async function() {
            return new Promise(resolve => {
                if(state.runs) {
                    stop.pending = true
                    stop.resolve = resolve
                } else {
                    resolve()
                }
            })
        }

        // disconnect callback
        if("serial" in navigator) {
            navigator.serial.addEventListener('disconnect', event => {
                if(event.target === port) {
                    state.runs = false
                    state.wait = null
                    stop.pending = false
                }
            })
        }

        // state values
        this._state = {
            //  digital and analog readings
            pins : { digital : [], analog : [] },
            // messages history
            msgs : { received : [], sent : [] },
            // flags for start button
            runs : false, wait : null,
            stop : stop
        }

        // for this scope
        const send = this.send
        const state = this._state
        // from global scope
        const MSG = _UNO_.MSG
        const VER = _UNO_.VER
        const LOG = _UNO_.LOG
        const HLP = _UNO_.HLP

    }

}