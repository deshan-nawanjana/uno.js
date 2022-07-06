const uno = new UNO.Controller()
// create state view
const sta = new UNO.StateView('Smoke Level', '0', 2, true)

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
    // start loop
    loop()
}

const loop = async function() {
    // get value from analog read
    const value = uno.analogRead(0)
    // update state view
    sta.update(value, 2)
    // update uno state
    await uno.update()
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