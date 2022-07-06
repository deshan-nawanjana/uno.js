const uno = new UNO.Controller()
// create state view
const sta = new UNO.StateView('Text Displaying', '', 2, true)
// create liquid crystal display
const lcd = new UNO.LiquidCrystalDisplay(uno)

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
    // start lcd
    await lcd.begin(16, 2)
    // start loop
    loop()
}

const loop = async function() {
    // set cursor position
    await lcd.setCursor(0, 0)
    // text to print
    const text = Date.now()
    // print on lcd
    await lcd.print(text)
    // update state view
    sta.update(text, 2)
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