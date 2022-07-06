const uno = new UNO.Controller()
// led pin
const pin = 5

const init = async function() {
    // start uno.js
    await uno.init()
    // set pin mode for led
    await uno.pinMode(pin, OUTPUT)
    // start loop
    loop()
}

const loop = async function() {
    // turn on led
    await uno.digitalWrite(pin, HIGH)
    // delay 500 milliseconds
    await uno.delay(500)
    // turn off led
    await uno.digitalWrite(pin, LOW)
    // delay 500 milliseconds
    await uno.delay(500)
    // loop again
    loop()
}

// create start button
const btn = new UNO.StartButton(uno, init)

// append start button to body
document.body.append(btn.element)