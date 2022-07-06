const uno = new UNO.Controller()
// create voltage monitor
const vlm = new UNO.VoltageMonitor(uno, true)
// create serial monitor
const srm = new UNO.SerialMonitor(uno, true)

const init = async function() {
    // start controller
    await uno.init()
    // show voltage monitor
    vlm.show()
    // show serial monitor
    srm.show()
    // start loop
    loop()
}

const loop = async function() {
    // update uno
    await uno.update()
    // loop again
    loop()
}

const stop = async function() {
    // stop controller
    await uno.stop()
    // hide voltage monitor
    vlm.hide()
    // hide serial monitor
    srm.hide()
}

// create start button
const btn = new UNO.StartButton(uno, init, stop)

// append start button to body
document.body.append(btn.element)

// append voltage monitor to body
document.body.append(vlm.element)

// append serial monitor to body
document.body.append(srm.element)