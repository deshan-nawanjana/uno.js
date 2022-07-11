UNO.VoltageMonitor = class {

    constructor(controller, hidden = false) {

        // update interval
        let interval = 50

        // dom element
        this.element = document.createElement('div')

        // setup element
        this.element.className = 'unojs-util unojs-util-voltage-monitor'

        // inner elements
        this.element.innerHTML = `
            <div class="analog-panel-title">Analog Inputs</div>
            <div class="analog-panel">
                <div class="analog-index"></div>
                <div class="analog-values"></div>
                <canvas class="analog-canvas" width="270" height="0"></canvas>
            </div>
            <div class="digital-panel-title">Digital Pins</div>
            <div class="digital-panel">
                <div class="digital-index"></div>
                <div class="digital-values"></div>
                <canvas class="digital-canvas" width="270" height="0"></canvas>
            </div>
        `

        // hidden state
        if(hidden) { this.element.style.display = 'none' }

        const digitalCanvas = this.element.querySelector('.digital-canvas')
        const analogCanvas = this.element.querySelector('.analog-canvas')

        const dContext = digitalCanvas.getContext('2d')
        const aContext = analogCanvas.getContext('2d')

        dContext.lineWidth = 0.8
        aContext.lineWidth = 0.8

        let old = {}

        const checkPanelSize = (name, array) => {
            const vBox = this.element.querySelector('.' + name + '-values')
            // check array length with children count
            if(vBox.children.length === array.length) { return }
            // define elements
            const iBox = this.element.querySelector('.' + name + '-index')
            const cnv = this.element.querySelector('.' + name + '-canvas')
            const ctx = cnv.getContext('2d')
            // get canvas diamensions
            const w = 270
            const h = array.length * 30
            // set canvas height
            cnv.setAttribute('height', h)
            // clear canvas
            ctx.clearRect(0, 0, w, h)
            // clear elements
            iBox.innerHTML = ''
            vBox.innerHTML = ''
            // for each value in array
            for(let i = 0; i < array.length; i++) {
                // index element
                const iElm = document.createElement('div')
                iElm.innerHTML = name[0].toUpperCase() + i
                iElm.className = 'value-index'
                iBox.appendChild(iElm)
                // value element
                const vElm = document.createElement('div')
                vElm.className = 'value-label'
                vElm.style.color =  _UNO_.CLR(i)
                vBox.appendChild(vElm)
                // draw line
                ctx.strokeStyle = _UNO_.CLR(i)
                ctx.lineWidth = 0.8
                ctx.beginPath()
                ctx.moveTo(0, i * 30 + 15)
                ctx.lineTo(w, i * 30 + 15)
                ctx.stroke()
            }
        }

        const updateCanvas = (name, array, devider) => {
            // get elements
            const vBox = this.element.querySelector('.' + name + '-values')
            const cnv = this.element.querySelector('.' + name + '-canvas')
            const ctx = cnv.getContext('2d')
            // return if 0 height
            if(cnv.height === 0) { return }
            // shift canvas graph
            ctx.globalCompositeOperation = "copy"
            ctx.drawImage(ctx.canvas, -20, 0)
            ctx.globalCompositeOperation = "source-over"
            // for each value in array
            for(let i = 0; i < array.length; i++) {
                // set value label
                vBox.children[i].innerHTML = array[i]
                // draw value
                const a = (old[name] ? old[name][i] : 0) / devider
                const b = (array[i]) / devider
                // draw line
                ctx.strokeStyle = _UNO_.CLR(i)
                ctx.beginPath()
                ctx.moveTo(250, i * 30 + 15 - a)
                ctx.lineTo(270, i * 30 + 15 - b)
                ctx.stroke()
            }
        }

        // update method
        const update = obj => {
            // check panel sizes
            checkPanelSize('analog', obj.analog)
            checkPanelSize('digital', obj.digital)
            // update canvases
            updateCanvas('analog', obj.analog, 68.2)
            updateCanvas('digital', obj.digital, 0.06666)
            // store history
            old = JSON.parse(JSON.stringify(obj))
        }

        // render loop
        const render = () => {
            update(controller._state.pins)
            setTimeout(() => {
                requestAnimationFrame(render)
            }, interval)
        }

        // start render
        render()

        this.setInterval = time => {
            interval = time
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}