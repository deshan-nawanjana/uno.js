const uno = new UNO.Controller()
// create state view
const sta = new UNO.StateView('Echo Distance', '0 cm', 2, true)
// create sensor with trigger pin and echo pin
const uss = new UNO.UltrasonicSensor(uno, 12, 13)

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
    // start sensor
    await uss.init()
    // start loop
    loop()
}

const loop = async function() {
    // read duration from sensor
    const duration = await uss.read()
    // calculate distance
    const distance = (duration * 340 * 100 * 0.5) / 1000000
    // update state view
    sta.update(distance + ' cm', 2)
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