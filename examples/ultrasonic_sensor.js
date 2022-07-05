const uno = new UNO()

const trig = 12
const echo = 13

const init = async function() {
    // start uno.js
    await uno.init()
    // set pin modes
    await uno.pinMode(trig, OUTPUT)
    await uno.pinMode(echo, INPUT)
    // start loop
    loop()
}

const loop = async function() {

    await uno.digitalWrite(trig, LOW)
    await uno.delayMicroseconds(2)
    
    await uno.digitalWrite(trig, HIGH)
    await uno.delayMicroseconds(10)

    await uno.digitalWrite(trig, LOW)

    const duration = await uno.pulseIn(echo, HIGH)
    const distance = ((duration / 2) * 3400 * 100) / 1000000
    console.log([duration], distance)

    loop()
}

document.querySelector('button').addEventListener('click', init)