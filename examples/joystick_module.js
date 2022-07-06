const uno = new UNO.Controller()
// create graph view
const grp = new UNO.GraphView('Axes Values', 2, 0, 1023, true)
// create state view
const sta = new UNO.StateView('Button Pressed State', 'NOT PRESSED', 0, true)

// define axes pins and switch pin
const PIN_AX = 0
const PIN_AY = 1
const PIN_SW = 2

const init = async function() {
    // start controller
    await uno.init()
    // show graph view
    grp.show()
    // show state view
    sta.show()
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
    // update graph view
    grp.update({ 'X' : x, 'Y' : y })
    // update state view
    sta.update(s ? 'NOT PRESSED' : 'PRESSED', 1 - s)
    // update uno state
    await uno.update()
    // loop again
    loop()
}

const stop = async function() {
    // stop controller
    await uno.stop()
    // hide graph view
    grp.hide()
    // hide state view
    sta.hide()
}

// create start button
const btn = new UNO.StartButton(uno, init, stop)

// append start button to body
document.body.append(btn.element)

// append graph view to body
document.body.append(grp.element)

// append state view to body
document.body.append(sta.element)