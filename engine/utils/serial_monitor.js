UNO.SerialMonitor = class {

    constructor(controller) {

        // update interval
        let interval = 50

        // monitor mode
        let mode = 'received'

        // dom element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unojs-util unojs-util-serial-monitor'

        // inner elements
        this.element.innerHTML = `
            <div class="serial-monitor-title">
                Serial Monitor
                <select>
                    <option value="received">Incomming Data</option>
                    <option value="sent">Outgoing Data</option>
                </select>
            </div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
            <div class="serial-monitor-item"></div>
        `

        const items = Array.from(this.element.querySelectorAll('.serial-monitor-item'))

        // mode selection listener
        this.element.querySelector('select').addEventListener('input', e => {
            mode = e.target.value
        })

        // update method
        const update = arr => {
            // for each item
            for(let i = 0; i < arr.length; i++) {
                items[i].innerHTML = '<div>' + arr[i].join('</div><div>') + '</div>'
            }
        }

        // render loop
        const render = () => {
            update(controller._state.msgs[mode])
            setTimeout(() => {
                requestAnimationFrame(render)
            }, interval)
        }

        // start render
        render()

        this.setInterval = time => {
            interval = time
        }

    }

}