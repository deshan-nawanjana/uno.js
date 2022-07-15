UNO.CommunicateView = class {

    constructor(communicator) {

        // create element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unojs-util unojs-util-communicate-view'

        // create child elements
        this.element.innerHTML = `
            <div class="communicate-view-title">Serial Communication</div>
            <div class="communicate-view-tray"></div>
            <div class="communicate-view-foot">
                <input
                    type="text"
                    placeholder="Type message here..."
                    autocomplete="off"
                    spellcheck="false"
                >
                <div class="communicate-view-label">Baud Rate</div>
                <select>
                    <option>300</option>
                    <option>1200</option>
                    <option>2400</option>
                    <option>4800</option>
                    <option>9600</option>
                    <option>19200</option>
                    <option>38400</option>
                    <option>57600</option>
                    <option>74880</option>
                    <option>115200</option>
                    <option>230400</option>
                    <option>250000</option>
                    <option>500000</option>
                    <option>1000000</option>
                    <option>2000000</option>
                </select>
            </div>
        `

        // get inner elements
        const tray = this.element.querySelector('.communicate-view-tray')
        const text = this.element.querySelector('input')
        const rate = this.element.querySelector('select')

        // remove older items
        const clearOverflow = () => {
            // get item array
            const arr = Array.from(tray.children)
            // for each item
            for(let i = arr.length - 1; i > -1; i--) {
                // remove if index larger than 30
                if(arr.length - i > 30) { arr[i].remove() }
            }
            // scroll to bottom of tray
            tray.scrollTop = 999999
        }

        // serial start listener
        communicator.addEventListener('start', event => {
            // set baud rate to select box
            rate.value = event.baudRate
        })

        // serial received listener
        communicator.addEventListener('message', event => {
            // create new item
            const item = document.createElement('div')
            item.className = 'communicate-view-received'
            item.innerHTML = event.data
            // append to tray
            tray.appendChild(item)
            // remove overflow
            clearOverflow()
        })

        // serial write listener
        communicator.addEventListener('write', event => {
            // create new item
            const item = document.createElement('div')
            item.className = 'communicate-view-sent'
            item.innerHTML = event.data
            // append to tray
            tray.appendChild(item)
            // remove overflow
            clearOverflow()
        })

        // text input key down listener
        text.addEventListener('keydown', event => {
            // return if serial not running
            if(communicator._state.runs === false) { return }
            // return if not enter key or empty string
            if(event.key === 'Enter' && text.value.length > 0) {
                // get message to send
                const data = text.value
                // clear text input
                text.value = ''
                // send message
                communicator.write(data)
            }
        })

        // select box input listener
        rate.addEventListener('input', () => {
            // restart serial to change baud rate
            communicator.restart(parseInt(rate.value))
        })
    }

}