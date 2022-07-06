/*!
 * uno.js v1.0.22 (https://github.com/deshan-nawanjana/uno.js)
 * Copyright 2022 Deshan Nawanjana
 * Licensed under the MIT license
 */

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
        'USS_READ' : 0 // unltrasonic pulseIn()
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

        // supported versions
        const versions = ['1.0.22']

        // init method
        this.init = async function() {
            return new Promise(resolve => {
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
                                if(versions.includes(ver)) {
                                    // set running flag
                                    state.runs = true
                                    state.wait = false
                                    begin = false
                                    // callback resolve
                                    resolve()
                                } else {
                                    // version not supported
                                    console.log('Please update the UNO.js Client.')
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

UNO.Accelerometer = class {

    constructor(controller) {

        this.powerOn = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.ACL_POWR, resolve, reject, [])
            })
        }

        const decoder = new TextDecoder()

        this.readAccel = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.ACL_READ, arr => {
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

UNO.LiquidCrystalDisplay = class {

    constructor(controller) {

        this.begin = async function(width, height) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_BEGN, resolve, reject, [width, height])
            })
        }

        this.setCursor = async function(x, y) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_CRSR, resolve, reject, [x, y])
            })
        }

        const encoder = new TextEncoder()

        this.print = async function(text) {
            const arr = Array.from(encoder.encode(text))
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_PRNT, resolve, reject, arr)
            })
        }

        this.clear = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.LCD_CLER, resolve, reject, [])
            })
        }

    }

}

UNO.ServoMotor = class {

    constructor(controller, pin) {

        this.pin = pin || null

        // attach method
        this.attach = async function(pin) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.SVR_ATCH, resolve, reject, [pin || this.pin])
            })
        }

        // write method
        this.write = async function(angle) {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_MODS, MTD.CAT_MODS.SVR_WRTE, resolve, reject, [angle])
            })
        }

    }

}

UNO.UltrasonicSensor = class {

    constructor(controller, triggerPin, echoPin) {

        // init method
        this.init = async function() {
            // pinmode for tigger and echo pins
            return controller.pinMode({
                OUTPUT : [triggerPin],
                INPUT : [echoPin]
            })
        }

        const decoder = new TextDecoder()

        // read method
        this.read = async function() {
            return new Promise((resolve, reject) => {
                controller.send(CAT.CAT_SNSR, MTD.CAT_SNSR.USS_READ, arr => {
                    // decode and resolve
                    resolve(parseInt(decoder.decode(new Uint8Array(arr))))
                }, reject, [triggerPin, echoPin])
            })
        }

    }

}

UNO.GraphView = class {

    constructor(title, parametersCount = 1, rangeMin = 0, rangeMax = 1023, hidden = false) {

        this.element = document.createElement('div')

        this.element.className = 'unojs-util unojs-util-graph-view'

        this.element.innerHTML = `
            <div class="graph-view-title">${title}</div>
            <div class="graph-view-inner" style="height: ${parametersCount * 60}px;">
                <div class="graph-view-labels"></div>
                <div class="graph-view-values"></div>
                <canvas height="${parametersCount * 60}" width="190"></canvas>
            </div>
        `

        // hidden state
        if(hidden) { this.element.style.display = 'none' }

        // get canvas and context
        const cnv = this.element.querySelector('canvas')
        const ctx = cnv.getContext('2d')

        // get elements
        const labels = this.element.querySelector('.graph-view-labels')
        const values = this.element.querySelector('.graph-view-values')

        // canvas height
        const w = 190

        // for each parameter
        for(let i = 0; i < Math.abs(parametersCount); i++) {
            // label element
            const lbl = document.createElement('div')
            lbl.className = 'label'
            lbl.innerHTML = '-'
            labels.appendChild(lbl)
            // value element
            const val = document.createElement('div')
            val.className = 'value'
            val.style.color = CLR(i)
            val.innerHTML = '0'
            values.appendChild(val)
            // draw line
            ctx.strokeStyle = CLR(i)
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(0, i * 60 + 30)
            ctx.lineTo(w, i * 60 + 30)
            ctx.stroke()
        }

        // old values
        let old = {}

        // calculate multiplier
        const mul = 30 / (rangeMax - rangeMin)

        this.update = input => {
            // shift canvas
            ctx.globalCompositeOperation = "copy"
            ctx.drawImage(ctx.canvas, -20, 0)
            ctx.globalCompositeOperation = "source-over"
            // for each input value
            Object.keys(input).forEach((label, index) => {
                // return overflowing parameter
                if(index > parametersCount) { return }
                // get value
                const value = input[label]
                // get elements
                const lbl = labels.children[index]
                const val = values.children[index]
                // set label
                if(lbl.innerHTML !== label) { lbl.innerHTML = label }
                // set value
                if(val.innerHTML !== value) { val.innerHTML = value }
                // draw value
                const a = (old[label] !== undefined ? old[label] : 0) * mul
                const b = value * mul
                // draw line
                ctx.strokeStyle = CLR(index)
                ctx.beginPath()
                ctx.moveTo(w - 20, (index * 60) + 30 - a)
                ctx.lineTo(w, (index * 60) + 30 - b)
                ctx.stroke()
            })
            // store history
            old = JSON.parse(JSON.stringify(input))
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}

UNO.SerialMonitor = class {

    constructor(controller, hidden = false) {

        // update interval
        let interval = 50

        // monitor mode
        let mode = 'received'

        // dom element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unojs-util unojs-util-serial-monitor'

        // inner elements
        this.element.innerHTML = `
            <div class="serial-monitor-title">
                Serial Monitor
                <select>
                    <option value="received">Incomming Data</option>
                    <option value="sent">Outgoing Data</option>
                </select>
            </div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
        `

        // hidden state
        if(hidden) { this.element.style.display = 'none' }

        const items = Array.from(this.element.querySelectorAll('.serial-monitor-item'))

        // mode selection listener
        this.element.querySelector('select').addEventListener('input', e => {
            mode = e.target.value
        })

        // update method
        const update = arr => {
            // for each item
            for(let i = 0; i < arr.length; i++) {
                items[i].innerHTML = '<div>' + arr[i].join('</div><div>') + '</div>'
            }
        }

        // render loop
        const render = () => {
            update(controller._state.msgs[mode])
            setTimeout(() => {
                requestAnimationFrame(render)
            }, interval)
        }

        // start render
        render()

        this.setInterval = time => {
            interval = time
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}

UNO.StartButton = class {

    constructor(controller, startEvent, stopEvent) {

        // create element
        this.element = document.createElement('button')

        // setup element
        this.element.className = 'unojs-util unojs-util-start-button start'

        // button mode
        let mode = 'start'

        this.element.addEventListener('click', () => {
            // return if busy
            if(mode === 'starting' || mode === 'stopping') { return }
            // select controller state
            if(controller._state.runs === false) {
                // start event
                startEvent()
            } else {
                if(stopEvent) {
                    // stop event
                    stopEvent()
                } else {
                    // stop controller
                    controller.stop()
                }
            }
        })

        // update method
        const update = () => {
            // get controller states
            const runs = controller._state.runs
            const wait = controller._state.wait
            // select state
            if(runs === false && wait === null) {
                mode = 'start'
            } else if(runs === false && wait === true) {
                mode = 'starting'
            } else if(runs === true && wait === false) {
                mode = 'running'
            } else if(runs === true && wait === true) {
                mode = 'stopping'
            }

            if(this.element.lang !== mode) {
                this.element.lang = mode
                this.element.className = 'unojs-util unojs-util-start-button ' + mode
            }
        }

        // render loop
        const render = () => {
            update()
            setTimeout(() => {
                requestAnimationFrame(render)
            }, 50)
        }

        // start render
        render()

    }

}

UNO.StateView = class {

    constructor(title, text = 'NO_TEXT', colorIndex = 0, hidden = false) {

        this.element = document.createElement('div')

        this.element.className = 'unojs-util unojs-util-state-view'

        this.element.innerHTML = `
            <div class="state-view-title">${title}</div>
            <div class="state-view-inner">${text}</div>
        `

        if(hidden) { this.element.style.display = 'none' }

        const inner = this.element.querySelector('.state-view-inner')

        inner.style.backgroundColor = CLR(colorIndex)

        this.update = (text, colorIndex) => {
            inner.innerHTML = text
            inner.style.backgroundColor = CLR(colorIndex)
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}

UNO.VoltageMonitor = class {

    constructor(controller, hidden = false) {

        // update interval
        let interval = 50

        // dom element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unojs-util unojs-util-voltage-monitor'

        // inner elements
        this.element.innerHTML = `
            <div class="analog-panel-title">Analog Inputs</div>
            <div class="analog-panel">
                <div class="analog-index"></div>
                <div class="analog-values"></div>
                <canvas class="analog-canvas" width="270" height="0"></canvas>
            </div>
            <div class="digital-panel-title">Digital Pins</div>
            <div class="digital-panel">
                <div class="digital-index"></div>
                <div class="digital-values"></div>
                <canvas class="digital-canvas" width="270" height="0"></canvas>
            </div>
        `

        // hidden state
        if(hidden) { this.element.style.display = 'none' }

        const digitalCanvas = this.element.querySelector('.digital-canvas')
        const analogCanvas = this.element.querySelector('.analog-canvas')

        const dContext = digitalCanvas.getContext('2d')
        const aContext = analogCanvas.getContext('2d')

        dContext.lineWidth = 0.8
        aContext.lineWidth = 0.8

        let old = {}

        const checkPanelSize = (name, array) => {
            const vBox = this.element.querySelector('.' + name + '-values')
            // check array length with children count
            if(vBox.children.length === array.length) { return }
            // define elements
            const iBox = this.element.querySelector('.' + name + '-index')
            const cnv = this.element.querySelector('.' + name + '-canvas')
            const ctx = cnv.getContext('2d')
            // get canvas diamensions
            const w = 270
            const h = array.length * 30
            // set canvas height
            cnv.setAttribute('height', h)
            // clear canvas
            ctx.clearRect(0, 0, w, h)
            // clear elements
            iBox.innerHTML = ''
            vBox.innerHTML = ''
            // for each value in array
            for(let i = 0; i < array.length; i++) {
                // index element
                const iElm = document.createElement('div')
                iElm.innerHTML = name[0].toUpperCase() + i
                iElm.className = 'value-index'
                iBox.appendChild(iElm)
                // value element
                const vElm = document.createElement('div')
                vElm.className = 'value-label'
                vElm.style.color =  CLR(i)
                vBox.appendChild(vElm)
                // draw line
                ctx.strokeStyle = CLR(i)
                ctx.lineWidth = 0.8
                ctx.beginPath()
                ctx.moveTo(0, i * 30 + 15)
                ctx.lineTo(w, i * 30 + 15)
                ctx.stroke()
            }
        }

        const updateCanvas = (name, array, devider) => {
            // get elements
            const vBox = this.element.querySelector('.' + name + '-values')
            const cnv = this.element.querySelector('.' + name + '-canvas')
            const ctx = cnv.getContext('2d')
            // return if 0 height
            if(cnv.height === 0) { return }
            // shift canvas graph
            ctx.globalCompositeOperation = "copy"
            ctx.drawImage(ctx.canvas, -20, 0)
            ctx.globalCompositeOperation = "source-over"
            // for each value in array
            for(let i = 0; i < array.length; i++) {
                // set value label
                vBox.children[i].innerHTML = array[i]
                // draw value
                const a = (old[name] ? old[name][i] : 0) / devider
                const b = (array[i]) / devider
                // draw line
                ctx.strokeStyle = CLR(i)
                ctx.beginPath()
                ctx.moveTo(250, i * 30 + 15 - a)
                ctx.lineTo(270, i * 30 + 15 - b)
                ctx.stroke()
            }
        }

        // update method
        const update = obj => {
            // check panel sizes
            checkPanelSize('analog', obj.analog)
            checkPanelSize('digital', obj.digital)
            // update canvases
            updateCanvas('analog', obj.analog, 68.2)
            updateCanvas('digital', obj.digital, 0.06666)
            // store history
            old = JSON.parse(JSON.stringify(obj))
        }

        // render loop
        const render = () => {
            update(controller._state.pins)
            setTimeout(() => {
                requestAnimationFrame(render)
            }, interval)
        }

        // start render
        render()

        this.setInterval = time => {
            interval = time
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}

const UNO_CSS = document.createElement('style')

UNO_CSS.innerHTML = `

.unojs-util-graph-view {
    width: 300px;
    display: block;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    margin: 20px;
    box-shadow: 0px 3px 15px rgba(0,0,0,0.1);
    user-select: none;
    outline: none;
    background-color: #222;
}

.unojs-util-graph-view > .graph-view-title {
    text-align: center;
    height: 40px;
    line-height: 40px;
    color: #FFF6;
    font-size: 12px;
    background-color: #1118;
    text-align: left;
    padding: 0px 0px 0px 15px;
}

.graph-view-inner {
    width: 300px;
    display: flex;
}

.graph-view-labels {
    width: 70px;
    font-size: 10px;
}

.graph-view-values {
    width: 40px;
    background-color: #1112;
    font-size: 10px;
}

.graph-view-labels > .label {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #FFF5;
}

.graph-view-values > .value {
    height: 60px;
    line-height: 60px;
    text-align: center;
}

.unojs-util-serial-monitor {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    background-color: #222;
    width: calc(100% - 40px);
    height: 285px;
    box-shadow: 0px 3px 15px rgba(0,0,0,0.1);
    max-height: calc(100vh - 40px);
    overflow-y: hidden;
    overflow-x: hidden;
    cursor: default;
    font-size: 10px;
    margin: 20px;
    user-select: none;
    outline: none;
}

.serial-monitor-title {
    text-align: center;
    height: 40px;
    line-height: 40px;
    color: #FFF6;
    font-size: 12px;
    background-color: #1118;
    text-align: left;
    padding: 0px 0px 0px 15px;
}

.serial-monitor-item {
    height: 30px;
    white-space: nowrap;
    font-size: 10px;
    color: #FFF6;
    overflow: hidden;
    padding: 0px 10px 0px 10px;
}

.serial-monitor-item > div {
    width: 20px;
    text-align: center;
    line-height: 30px;
    display: inline-block;
    font-size: 8px;
}

.serial-monitor-title > select {
    float: right;
    height: 40px;
    border: none;
    padding: 0px 10px 0px 0px;
    margin: 0px 5px 0px 0px;
    width: 140px;
    text-align: right;
    outline: none;
    background-color: transparent;
    color: #FFF6;
}

.serial-monitor-title > select > option {
    background-color: #222;
    color: #FFF6;
}

.unojs-util-start-button {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    height: 50px;
    background-color: #3366ff;
    border: none;
    color: #FFF;
    cursor: pointer;
    font-size: 18px;
    line-height: 45px;
    color: #FFFE;
    background-position: 5px 5px;
    background-repeat: no-repeat;
    background-size: auto calc(100% - 10px);
    padding-right: 20px;
    padding-left: 50px;
    box-shadow: 0px 3px 15px rgba(0,0,0,0.1);
    opacity: 0.9;
    text-align: center;
    margin: 20px;
    display: block;
    user-select: none;
    outline: none;
}

.unojs-util-start-button:hover {
    opacity: 1;
}

.unojs-util-start-button.start {
    background-image: url('data:image/svg+xml,<svg version="1.1" viewBox="0 0 24 24" width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill: rgb(255, 255, 255); opacity: 1; transform: rotate(0deg) scale(0.8, 0.8);"><g><path d="M8 5v14l11-7z"></path></g></svg>');
}

.unojs-util-start-button.start::after {
    content: 'START';
}

.unojs-util-start-button.starting {
    width: 160px;
    background-image: url("data:image/svg+xml,%3Csvg width='80px' height='80px' xmlns='http://www.w3.org/2000/svg' viewBox='-10 0 100 100' preserveAspectRatio='xMidYMid' class='lds-bars' style=''%3E%3Crect ng-attr-x='%7B%7Bconfig.x1%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff44' x='14' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.6s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3Crect ng-attr-x='%7B%7Bconfig.x2%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff44' x='34' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.4s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3Crect ng-attr-x='%7B%7Bconfig.x3%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff44' x='54' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.2s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3C/svg%3E");
}

.unojs-util-start-button.starting::after {
    content: 'WAITING';
}

.unojs-util-start-button.running {
    width: 160px;
    background-image: url("data:image/svg+xml,%3Csvg width='80px' height='80px' xmlns='http://www.w3.org/2000/svg' viewBox='-10 0 100 100' preserveAspectRatio='xMidYMid' class='lds-bars' style=''%3E%3Crect ng-attr-x='%7B%7Bconfig.x1%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff' x='14' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.6s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3Crect ng-attr-x='%7B%7Bconfig.x2%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff' x='34' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.4s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3Crect ng-attr-x='%7B%7Bconfig.x3%7D%7D' y='30' ng-attr-width='%7B%7Bconfig.width%7D%7D' height='40' fill='%23ffffff' x='54' width='12'%3E%3Canimate attributeName='opacity' calcMode='spline' values='1;0.2;1' keyTimes='0;0.5;1' dur='1' keySplines='0.5 0 0.5 1;0.5 0 0.5 1' begin='-0.2s' repeatCount='indefinite'%3E%3C/animate%3E%3C/rect%3E%3C/svg%3E");
}

.unojs-util-start-button.running:hover {
    background-image: url('data:image/svg+xml,<svg version="1.1" viewBox="0 0 16 16" width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill: rgb(255, 255, 255); opacity: 1; transform: rotate(0deg) scale(1, 1);"><g><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></g></svg>');
}

.unojs-util-start-button.running::after {
    content: 'RUNNING';
}

.unojs-util-start-button.running:hover::after {
    content: 'STOP';
}

.unojs-util-start-button.stopping {
    background-image: url('data:image/svg+xml,<svg version="1.1" viewBox="0 0 24 24" width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill: rgb(255, 255, 255); opacity: 1; transform: rotate(0deg) scale(0.8, 0.8);"><g><path d="M8 5v14l11-7z"></path></g></svg>');
}

.unojs-util-start-button.stopping::after {
    content: 'STOPPING';
}

.unojs-util-state-view {
    width: 300px;
    height: 240px;
    display: block;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    margin: 20px;
    box-shadow: 0px 3px 15px rgba(0,0,0,0.1);
    user-select: none;
    outline: none;
}

.unojs-util-state-view > .state-view-title {
    text-align: center;
    height: 40px;
    line-height: 40px;
    color: #FFF6;
    font-size: 12px;
    background-color: #1118;
    text-align: left;
    padding: 0px 0px 0px 15px;
}

.unojs-util-state-view > .state-view-inner {
    height: 200px;
    text-align: center;
    line-height: 180px;
    font-weight: 500;
    font-size: 18px;
    color: #FFF;
}

.unojs-util-voltage-monitor {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    background-color: #222;
    width: 350px;
    box-shadow: 0px 3px 15px rgba(0,0,0,0.1);
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: default;
    margin: 20px;
    user-select: none;
    outline: none;
}

.unojs-util-voltage-monitor::-webkit-scrollbar {
    width: 3px;
    height: 3px;
}

.unojs-util-voltage-monitor::-webkit-scrollbar-thumb {
    background-color: #1111;
}

.unojs-util-voltage-monitor:hover::-webkit-scrollbar-thumb {
    background-color: #FFF5;
}

.unojs-util-voltage-monitor > .digital-panel,
.unojs-util-voltage-monitor > .analog-panel {
    display: flex;
}

.digital-panel > .digital-values,
.analog-panel > .analog-values {
    background-color: #1112;
    width: 40px;
}

.digital-panel > .digital-canvas,
.analog-panel > .analog-canvas {
    width: 270px;
}

.digital-values > .value-label,
.analog-values > .value-label {
    font-size: 10px;
    text-align: center;
    color: #FFF7;
    height: 30px;
    line-height: 30px;
}

.analog-index > .value-index,
.analog-values > .value-label,
.digital-index > .value-index,
.digital-values > .value-label {
    font-size: 10px;
    text-align: center;
    color: #FFF5;
    height: 30px;
    line-height: 30px;
    width: 40px;
}

.unojs-util-voltage-monitor > .analog-panel-title, 
.unojs-util-voltage-monitor > .digital-panel-title {
    text-align: center;
    height: 40px;
    line-height: 40px;
    color: #FFF6;
    font-size: 12px;
    background-color: #1118;
}

`

if(document.head) {
    document.head.appendChild(UNO_CSS)
} else if(document.body) {
    document.body.appendChild(UNO_CSS)
} else {
    document.documentElement.append(UNO_CSS)
}