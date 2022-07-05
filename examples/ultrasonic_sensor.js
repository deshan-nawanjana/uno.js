const uno = new UNO()
// create sensor with trigger pin and echo pin
const uss = new UNO.UltrasonicSensor(uno, 12, 13)

const init = async function() {
    // start controller
    await uno.init()
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
    // print distance
    console.log(distance)
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)