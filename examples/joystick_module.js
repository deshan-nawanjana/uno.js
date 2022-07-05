const uno = new UNO()

// define axis pins and switch pin
const PIN_AX = 0
const PIN_AY = 1
const PIN_SW = 2

const init = async function() {
    // start uno.js
    await uno.init()
    // set pin mode for switch pin
    await uno.pinMode(PIN_SW, INPUT_PULLUP)
    // start loop
    loop()
}

const loop = async function() {
    // read pin values
    const x = uno.analogRead(PIN_AX)
    const y = uno.analogRead(PIN_AY)
    const s = uno.digitalRead(PIN_SW)
    // print values
    console.log(x, y, s)
    // update uno state
    await uno.update()
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)