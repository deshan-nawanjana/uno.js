const docs = {}

docs['Getting Started'] = {
    'Introduction' : 'getting_started/introduction.html',
    'Browser Requirements' : 'getting_started/browser_requirements.html',
    'Setup Your Controller' : 'getting_started/setup_your_controller.html',
    'First Program' : 'getting_started/first_program.html'
}

docs['Basics'] = {
    'Init, Loop and Stop' : 'basics/init_loop_and_stop.html',
    'Built-In Functions' : 'basics/built_in_functions.html'
}

docs['Modules'] = {
    'Accelerometer' : 'modules/accelerometer.html',
    'Liquid Crystal Display' : 'modules/liquid_crystal_display.html',
    'Servo Motor' : 'modules/servo_motor.html',
    'Joystick Module' : 'modules/joystick_module.html',
    'Buzzer Module' : 'modules/buzzer_module.html'
}

docs['Sensors'] = {
    'Ultrasonic Sensor' : 'sensors/ultrasonic_sensor.html',
    'IR Sensor' : 'sensors/ir_sensor.html',
    'Microphone Sensor' : 'sensors/microphone_sensor.html',
    'Flame Detection Sensor' : 'sensors/flame_detection_sensor.html',
    'Smoke Detection Sensor' : 'sensors/smoke_detection_sensor.html',
    'PIR Sensor' : 'sensors/pir_sensor.html',
    'Hall Effect Sensor' : 'sensors/hall_effect_sensor.html',
    'Barometric Pressure Sensor' : 'sensors/barometric_pressure_sensor.html'
}

docs['Utils'] = {
    'Start Button' : 'utils/start_button.html',
    'Voltage Monitor' : 'utils/voltage_monitor.html',
    'Serial Monitor' : 'utils/serial_monitor.html',
    'Serial Monitor' : 'utils/serial_monitor.html',
    'State View' : 'utils/state_view.html',
    'Graph View' : 'utils/graph_view.html'
}

window.addEventListener('load', () => {
    // side panel tray
    const tray = document.querySelector('.side_panel_tray')
    // for each section
    Object.keys(docs).forEach(sect_name => {
        // create section title
        const s = document.createElement('div')
        s.className = 'side_panel_section_title'
        s.innerHTML = sect_name
        tray.appendChild(s)
        // for each file
        Object.keys(docs[sect_name]).forEach(file_name => {
            // create file title
            const f = document.createElement('div')
            f.className = 'side_panel_file_item'
            f.innerHTML = file_name
            f.lang = docs[sect_name][file_name]
            // file click event
            f.addEventListener('click', () => {
                location = '#' + docs[sect_name][file_name]
            })
            tray.appendChild(f)
        })
    })
})

const load = () => {
    // iframe element
    const view = document.querySelector('iframe')
    // get path from hash data
    const path = location.hash.toString().replace('#', '')
    // get item from side panel
    const item = document.querySelector(`[lang='${path}']`)
    // remove current opned item
    const oitm = document.querySelector('.side_panel_file_item.opned')
    if(oitm) { oitm.classList.remove('opned') }
    // check availability
    if(item) {
        // select opned item
        item.classList.add('opned')
        // open page
        view.src = item.lang
    } else {
        // geet first item
        const first = document.querySelector('.side_panel_file_item')
        first.classList.add('opned')
        // open page
        view.src = first.lang
    }
}

window.addEventListener('load', load)
window.addEventListener('hashchange', load)