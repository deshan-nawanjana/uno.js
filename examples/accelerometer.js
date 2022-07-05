const uno = new UNO()
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

document.querySelector('button').addEventListener('click', init)