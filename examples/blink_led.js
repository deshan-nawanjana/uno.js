const uno = new UNO.Controller()
// create state view
const sta = new UNO.StateView('LED ON / OFF State', 'DIODE OFF', 0, true)
// led pin
const pin = 13

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
    // set pin mode for led
    await uno.pinMode(pin, OUTPUT)
    // start loop
    loop()
}

const loop = async function() {
    // turn on led
    await uno.digitalWrite(pin, HIGH)
    // update state view
    sta.update('DIODE ON', 1)
    // delay 500 milliseconds
    await uno.delay(500)
    // turn off led
    await uno.digitalWrite(pin, LOW)
    // update state view
    sta.update('DIODE OFF', 0)
    // delay 500 milliseconds
    await uno.delay(500)
    // loop again
    loop()
}

const stop = async function() {
    // stop controller
    await uno.stop()
    // hide state view
    sta.hide()
}

// create start button
const btn = new UNO.StartButton(uno, init, stop)

// append start button to body
document.body.append(btn.element)

// append state view to body
document.body.append(sta.element)