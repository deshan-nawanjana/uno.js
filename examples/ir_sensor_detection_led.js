const uno = new UNO.Controller()
// create state view
const sta = new UNO.StateView('IR Detection', 'NOT DETECTED', 0, true)
// create graph view
const grp = new UNO.GraphView('Analog Read', 1, 0, 1023, true)

const init = async function() {
    // start controller
    await uno.init()
    // show state view
    sta.show()
    // show graph view
    grp.show()
    // set pin mode for led
    await uno.pinMode(5, OUTPUT)
    // start loop
    loop()
}

const loop = async function() {
    // update graph view
    grp.update({ 'A0' : uno.analogRead(0) })
    // check analog value from ir sensor
    if(uno.analogRead(0) > 300) {
        // update state view
        sta.update('NOT DETECTED', 0)
        // turn off led for no detection
        await uno.digitalWrite(5, LOW)
    } else {
        sta.update('DETECTED', 1)
        // turn on led for detection
        await uno.digitalWrite(5, HIGH)
    }
    // update uno state
    await uno.update()
    // loop again
    loop()
}

const stop = async function() {
    // stop controller
    await uno.stop()
    // hide state view
    sta.hide() 
    // hide graph view
    grp.hide() 
}

// create start button
const btn = new UNO.StartButton(uno, init, stop)

// append start button to body
document.body.append(btn.element)

// append graph view to body
document.body.append(grp.element)

// append state view to body
document.body.append(sta.element)