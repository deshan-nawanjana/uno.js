// create controller
const uno = new UNO.Controller()
// create audio context
const aud = document.createElement('audio')

let lvl = 4

const pins = [2, 3, 4, 5, 6, 7, 8, 9]

const init = async function() {
    // init controller
    await uno.init()
    // set pin modes
    await uno.pinMode({ OUTPUT : pins })
    // start loop
    loop()
}

const loop = async function() {
    analyser.getByteTimeDomainData(dataArray)
    lvl = parseInt((dataArray[7] - 50) / 10) - 6
    const a = []
    const b = []
    pins.forEach((pin, idx) => { idx < lvl ? a.push(pin) : b.push(pin) })
    await uno.digitalWrite({ HIGH : a, LOW : b })
    // next round
    loop()
}

const stop = async function() {
    await uno.stop()
}

const btn = new UNO.StartButton(uno, init, stop)
document.body.appendChild(btn.element)

const inp = document.createElement('input')

inp.setAttribute('type', 'file')

let analyser = null
let dataArray = []

inp.addEventListener('input', event => {

    // source context and analyser
    const context = new AudioContext()
    const source = context.createMediaElementSource(aud)
    analyser = context.createAnalyser()
    // setup analyser
    analyser.fftSize = 64
    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    // connect source
    source.connect(analyser)
    analyser.connect(context.destination)


    const url = URL.createObjectURL(event.target.files[0])
    aud.addEventListener('load', () => {
        URL.revokeObjectURL(url)
    })
    aud.src = url
    aud.play()
})




document.body.appendChild(inp)