const uno = new UNO.Controller()
// create accelerometer
const acc = new UNO.Accelerometer(uno)
// create graph view
const grp = new UNO.GraphView('Accelerometer Values', 3, -240, 240, true)


const init = async function() {
    // start controller
    await uno.init()
    // show graph view
    grp.show()
    // power on module
    await acc.powerOn()
    // start loop
    loop()
}

const loop = async function() {
    // read x, y, z orientation
    const data = await acc.readAccel()
    // update graph view
    grp.update({ 'X' : data.x, 'Y' : data.y, 'Z' : data.z })
    // loop again
    loop()
}

const stop = async function() {
    // stop controller
    await uno.stop()
    // hide graph view
    grp.hide()
}

// create start button
const btn = new UNO.StartButton(uno, init, stop)

// append start button to body
document.body.append(btn.element)

// append graph view to body
document.body.append(grp.element)