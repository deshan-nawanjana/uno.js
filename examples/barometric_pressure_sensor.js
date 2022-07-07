const uno = new UNO.Controller()
// create graph view for temperature
const grp_1 = new UNO.GraphView('BPS Temperature (C)', 1, 0, 60, true)
// create graph view for pressure
const grp_2 = new UNO.GraphView('BPS Pressure (hPa)', 2, 0, 2000, true)
// create barometric pressure sensor
const bps = new UNO.BarometricPressureSensor(uno, 35.6)

const init = async function() {
    await uno.init()
    grp_1.show()
    grp_2.show()
    await bps.begin()
    loop()
}

const loop = async function() {
    const obj = await bps.read()
    grp_1.update({
        'Temp' : obj.temperature
    })
    grp_2.update({
        'Common' : obj.pressure,
        'Relative' : obj.relativePressure
    })
    loop()
}

const stop = async function() {
    await uno.stop()
    grp_1.hide()
    grp_2.hide()
}

const btn = new UNO.StartButton(uno, init, stop)

document.body.append(btn.element)

document.body.append(grp_1.element)

document.body.append(grp_2.element)