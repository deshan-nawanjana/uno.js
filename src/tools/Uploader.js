UNO.Uploader = class {
    
    constructor() {

        let busy = false

        this.upload = async function(board, hexData) {
            return new Promise((resolve, reject) => {
                if(busy) {
                    reject('Uploder is busy.')
                } else {
                    busy = true
                    // store hex data
                    _UNO_.TMP.HEX = hexData
                    // create flasher
                    const falsher = new AvrgirlArduino({ board : board, debug : false })
                    // upload
                    falsher.flash(hexData, error => {
                        if(error) {
                            // get avr port
                            const port = _UNO_.TMP.AVR
                            // select error type
                            if(port && port.isOpen) {
                                this.abort().then(() => {
                                    // reject if error
                                    reject(error)
                                    busy = false
                                }).catch(() => {
                                    reject(error)
                                    busy = false
                                })
                            } else {
                                // reject if error
                                reject(error)
                                busy = false
                            }
                        } else {
                            // uploaded
                            resolve()
                            busy = false
                        }
                    })
                }
            })
        }

        this.uploadFile = async function(board, file) {
            return new Promise((resolve, reject) => {
                fetch(file).then(x => x.text()).then(hexData => {
                    this.upload(board, hexData).then(resolve).catch(reject)
                }).catch(reject)
            })
        }

        this.abort = async function() {
            const avr = _UNO_.TMP.AVR
            const port = avr.port
            if(avr.reader.cancel) { await avr.reader.cancel() }
            if(avr.writer.cancel) { await avr.writer.cancel() }
            if(port.writable.locked) { avr.reader.releaseLock() }
            if(port.writable.locked) { avr.writer.releaseLock() }
            if(port.close) { await port.close() }
            return true
        }

    }

}