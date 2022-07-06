const uno = new UNO.Controller()
// create accelerometer
const acc = new UNO.Accelerometer(uno)

const init = async function() {
    // start uno.js
    await uno.init()
    // power on module
    await acc.powerOn()
    // start loop
    loop()
}

const loop = async function() {
    // read x, y, z orientation
    const data = await acc.readAccel()
    // print values
    console.log(data)
    // loop again
    loop()
}

// create start button
const btn = new UNO.StartButton(uno, init)

// append start button to body
document.body.append(btn.element)