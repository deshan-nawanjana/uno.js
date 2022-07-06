const uno = new UNO.Controller()
//  create state view
const sta = new UNO.StateView('Servo Motor State', '0', 2, true)
// create motor with attached pin 4
const svr = new UNO.ServoMotor(uno, 4)

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
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
        // update state view
        sta.update('Angle : ' + i, 2)
        // delay 100 milliseconds
        await uno.delay(100)
    }
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