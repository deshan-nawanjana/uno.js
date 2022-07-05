UNO.StateUI = class {

    constructor(controller) {

        this.isStateUI = true

        // add to controller utiles
        controller.utils.push(this)

        // dom element
        this.domElement = document.createElement('div')
        // setup element
        this.domElement.className = 'unojs-util unojs-util-state-ui'
        // inner elements
        this.domElement.innerHTML = `
            <div class="analog-panel">
                <div class="analog-values"></div>
                <canvas class="analog-canvas" width="270" height="300"></canvas>
            </div>
            <div class="digital-panel">
                <div class="digital-values"></div>
                <canvas class="digital-canvas" width="270" height="300"></canvas>
            </div>
        `

        const digitalValues = this.domElement.querySelector('.digital-values')
        const analogValues = this.domElement.querySelector('.analog-values')
        
        const digitalCanvas = this.domElement.querySelector('.digital-canvas')
        const analogCanvas = this.domElement.querySelector('.analog-canvas')

        const dContext = digitalCanvas.getContext('2d')
        const aContext = analogCanvas.getContext('2d')

        dContext.lineWidth = 0.8
        aContext.lineWidth = 0.8

        const colors = [
            'ff3300', '00cc99', '0066cc', '6666ff', 'ff66cc', 'ff9933',
            'ff3300', '00cc99', '0066cc', '6666ff', 'ff66cc', 'ff9933',
            'ff3300', '00cc99', '0066cc', '6666ff', 'ff66cc', 'ff9933'
        ]

        let old = {}

        const checkPanelSize = obj => {
            // digital values
            if(digitalValues.children.length !== obj.digital.length) {
                // clear element
                digitalValues.innerHTML = ''
                // for each value
                for(let i = 0; i < obj.digital.length; i++) {
                    // create new element
                    const e = document.createElement('div')
                    e.className = 'value-label'
                    e.style.color =  '#' + colors[i]
                    // append to panel
                    digitalValues.appendChild(e)
                }
                // get diamensions
                const w = 270
                const h = obj.digital.length * 30
                // set canvas height
                digitalCanvas.setAttribute('height', h)
                // clear react
                dContext.clearRect(0, 0, w, h)
                // for each value
                for(let i = 0; i < obj.digital.length; i++) {
                    // draw line
                    dContext.strokeStyle = '#' + colors[i]
                    dContext.lineWidth = 0.8
                    dContext.beginPath()
                    dContext.moveTo(0, i * 30 + 15)
                    dContext.lineTo(w, i * 30 + 15)
                    dContext.stroke()
                }
            }
            // analog values
            if(analogValues.children.length !== obj.analog.length) {
                // clear element
                analogValues.innerHTML = ''
                // for each value
                for(let i = 0; i < obj.analog.length; i++) {
                    // create new element
                    const e = document.createElement('div')
                    e.className = 'value-label'
                    e.style.color =  '#' + colors[i]
                    // append to panel
                    analogValues.appendChild(e)
                }
                // get diamensions
                const w = 270
                const h = obj.analog.length * 30
                // set canvas height
                analogCanvas.setAttribute('height', h)
                // clear react
                aContext.clearRect(0, 0, w, h)
                // for each value
                for(let i = 0; i < obj.analog.length; i++) {
                    // draw line
                    aContext.strokeStyle = '#' + colors[i]
                    aContext.beginPath()
                    aContext.moveTo(0, i * 30 + 15)
                    aContext.lineTo(w, i * 30 + 15)
                    aContext.stroke()
                }
            }
        }

        // update method
        this.update = obj => {
            // check panel size
            checkPanelSize(obj)

            // for each digital value
            for(let i = 0; i < obj.digital.length; i++) {
                digitalValues.children[i].innerHTML = obj.digital[i]
            }

            // translate canvas
            dContext.globalCompositeOperation = "copy"
            dContext.drawImage(dContext.canvas, -10, 0)
            dContext.globalCompositeOperation = "source-over"

            // draw values
            for(let i = 0; i < obj.digital.length; i++) {
                const a = (old.digital ? old.digital[i] : 0) * 15
                const b = (obj.digital[i]) * 15
                // draw line
                dContext.strokeStyle = '#' + colors[i]
                dContext.beginPath()
                dContext.moveTo(260, i * 30 + 15 - a)
                dContext.lineTo(270, i * 30 + 15 - b)
                dContext.stroke()
            }

            // for each analog value
            for(let i = 0; i < obj.analog.length; i++) {
                analogValues.children[i].innerHTML = obj.analog[i]
            }

            // translate canvas
            aContext.globalCompositeOperation = "copy"
            aContext.drawImage(aContext.canvas, -10, 0)
            aContext.globalCompositeOperation = "source-over"

            // draw values
            for(let i = 0; i < obj.analog.length; i++) {
                const a = (old.analog ? old.analog[i] : 0) / 68.2
                const b = (obj.analog[i]) / 68.2
                // draw line
                aContext.strokeStyle = '#' + colors[i]
                aContext.beginPath()
                aContext.moveTo(260, i * 30 + 15 - a)
                aContext.lineTo(270, i * 30 + 15 - b)
                aContext.stroke()
            }

            // store history
            old = obj

        }

    }

}