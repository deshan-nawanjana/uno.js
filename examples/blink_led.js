const uno = new UNO()

const init = async function() {
    // start uno.js
    await uno.init()
    // set pin mode for led
    await uno.pinMode(5, OUTPUT)
    // start loop
    loop()
}

const loop = async function() {
    // turn on led
    await uno.digitalWrite(5, HIGH)
    // delay 500 milliseconds
    await uno.delay(500)
    // turn off led
    await uno.digitalWrite(5, LOW)
    // delay 500 milliseconds
    await uno.delay(500)
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)