UNO.Communicator = class {
    
    constructor() {

        // serial port object
        let port = null
        // waiting to stop details
        let stop = { pending : false, resolve : null, reject : null }
        // baud rate
        let rate = null

        // text encoder and decoder
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        // start method
        this.start = async function(baudRate = 9600) {
            return new Promise((resolve, reject) => {
                // update wait flag
                state.wait = true
                // request port
                navigator.serial.requestPort().then(portObject => {
                    // store port and baud rate
                    port = portObject
                    rate = baudRate
                    // open port
                    port.open({ baudRate : baudRate }).then(() => {
                        // get reader and writer
                        port.reader = port.readable.getReader()
                        port.writer = port.writable.getWriter()
                        readLoop()
                        callbackListeners('start')
                        // set state flags
                        state.wait = false
                        state.runs = true
                        resolve()
                    }).catch(() => {
                        // reject open port
                        state.wait = null
                        callbackListeners('error', { method : 'start' })
                        reject()
                    })
                }).catch(() => {
                    // reject request port
                    state.wait = null
                    callbackListeners('error', { method : 'start' })
                    reject()
                })
            })
        }

        this.restart = async function(baudRate = 9600) {
            return new Promise((resolve, reject) => {
                this.stop().then(() => {
                    setTimeout(() => {
                        port.open({ baudRate : baudRate }).then(() => {
                            // store and baud rate
                            rate = baudRate
                            // get reader and writer
                            port.reader = port.readable.getReader()
                            port.writer = port.writable.getWriter()
                            readLoop()
                            callbackListeners('start')
                            // set state flags
                            state.wait = false
                            state.runs = true
                            resolve()
                        }).catch(reject)
                    }, 1000)
                }).catch(() => {
                    // stop error callback
                    callbackListeners('error', { method : 'restart' })
                    // reject error
                    reject()
                })
            })
        }

        // message remainder
        let remainder = ''

        // read method
        const readLoop = () => {
            // check for stop flag
            if(stop.pending === false) {
                // read port data
                port.reader.read().then(obj => {
                    // decode message
                    const data = decoder.decode(obj.value)
                    // callback read
                    callbackListeners('read', { data : data })
                    // combine with remainder
                    remainder += data
                    // fetch and callback messages
                    fetchMessages()
                    // read again
                    readLoop()
                })
            } else {
                // abort communication
                abortCommunication().then(() => {
                    // callback stop
                    callbackListeners('stop')
                    // update state flags
                    state.runs = false
                    state.wait = null
                    stop.pending = false
                    // resolve stop
                    stop.resolve()
                }).catch(() => {
                    // callback error
                    callbackListeners('error', { method : 'stop' })
                    // reject error
                    stop.reject()
                })
            }
        }

        // fetch messages from remainder method
        const fetchMessages = () => {
            // split remainder with new line
            const arr = remainder.split('\r\n')
            // if any message
            if(arr.length > 1) {
                // until last message
                for(let i = 0; i < arr.length - 1; i++) {
                    // push to received history
                    state.msgs.received.push(arr[i])
                    // callback message
                    callbackListeners('message', { data : arr[i] })
                }
                // update remainder
                remainder = arr[arr.length - 1]
            }
        }

        // write method
        this.write = async function(data) {
            return new Promise((resolve, reject) => {
                // buffer to generate
                let buffer = null
                // select data type
                if(typeof data === 'string' || typeof data === 'number') {
                    // string message
                    buffer = encoder.encode(data.toString())
                } else if(Array.isArray(data)) {
                    // buffer array
                    buffer = new Uint8Array(data)
                } else {
                    // data type error
                    reject()
                }
                // write on port
                port.writer.write(buffer).then(() => {
                    // push to sent history
                    state.msgs.sent.push(data)
                    // callback write
                    callbackListeners('write', { data : data })
                    // resovlve write
                    resolve()
                }).catch(() => {
                    // callback error
                    callbackListeners('error', { method : 'write', data : data })
                    // reject error
                    reject()
                })
            })
        }

        // stop method
        this.stop = async function() {
            return new Promise((resolve, reject) => {
                // set flags and callbacks to stop
                stop.pending = true
                stop.resolve = resolve
                stop.reject = reject
            })
        }

        // abort communication method
        const abortCommunication = async function() {
            // cancel reader and writer
            if(port.reader.cancel) { await port.reader.cancel() }
            if(port.writer.cancel) { await port.writer.cancel() }
            // release locks
            if(port.writable.locked) { port.reader.releaseLock() }
            if(port.writable.locked) { port.writer.releaseLock() }
            // close port
            if(port.close) { await port.close() }
            // return true
            return true
        }

        // event listener list
        let listeners = {
            'message' : [],
            'error' : [],
            'disconnect' : [],
            'read' : [],
            'write' : [],
            'start' : [],
            'stop' : []
        }

        // add event listener method
        this.addEventListener = (type, callback) => {
            // add listener if only valid
            if(listeners[type]) { listeners[type].push(callback) }
        }

        const callbackListeners = (type, object = {}) => {
            // store common data in object
            object.type = type
            object.timeStamp = Date.now()
            object.baudRate = rate
            // for each listener
            for(let i = 0; i < listeners[type].length; i++) {
                // callback
                listeners[type][i](object)
            }
        }

        // disconnect callback
        if("serial" in navigator) {
            navigator.serial.addEventListener('disconnect', event => {
                if(event.target === port) {
                    // update state flags
                    state.runs = false
                    state.wait = null
                    // callback disconnect
                    callbackListeners('disconnect')
                }
            })
        }

        // state values
        this._state = {
            msgs : { received : [], sent : [] },
            runs : false, wait : null,
            stop : stop
        }

        // for this scope
        const state = this._state

    }

}