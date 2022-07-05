const uno = new UNO()
// create motor with attached pin 4
const svr = new UNO.ServoMotor(uno, 4)

const init = async function() {
    // start controller
    await uno.init()
    // attach motor
    await svr.attach()
    // start loop
    loop()
}

const loop = async function() {
    // angle for loop
    for(let i = 0; i < 181; i += 10) {
        // write angle to motor
        await svr.write(i)
        // delay 100 milliseconds
        await uno.delay(100)
    }
    // loop again
    loop()
}

document.querySelector('button').addEventListener('click', init)