const uno = new UNO.Controller()
// create voltage monitor
const vlm = new UNO.VoltageMonitor(uno)
// create serial monitor
const srm = new UNO.SerialMonitor(uno)

const init = async function() {
    // start uno.js
    await uno.init()
    // start loop
    loop()
}

const loop = async function() {
    // update uno
    await uno.update()
    // loop again
    loop()
}

// create start button
const btn = new UNO.StartButton(uno, init)

// append voltage monitor to body
document.body.append(vlm.element)

// append serial monitor to body
document.body.append(srm.element)

// append start button to body
document.body.append(btn.element)