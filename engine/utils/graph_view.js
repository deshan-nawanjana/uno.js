UNO.GraphView = class {

    constructor(title, parametersCount = 1, rangeMin = 0, rangeMax = 1023, hidden = false) {

        this.element = document.createElement('div')

        this.element.className = 'unojs-util unojs-util-graph-view'

        this.element.innerHTML = `
            <div class="graph-view-title">${title}</div>
            <div class="graph-view-inner" style="height: ${parametersCount * 60}px;">
                <div class="graph-view-labels"></div>
                <div class="graph-view-values"></div>
                <canvas height="${parametersCount * 60}" width="190"></canvas>
            </div>
        `

        // hidden state
        if(hidden) { this.element.style.display = 'none' }

        // get canvas and context
        const cnv = this.element.querySelector('canvas')
        const ctx = cnv.getContext('2d')

        // get elements
        const labels = this.element.querySelector('.graph-view-labels')
        const values = this.element.querySelector('.graph-view-values')

        // canvas height
        const w = 190

        // for each parameter
        for(let i = 0; i < Math.abs(parametersCount); i++) {
            // label element
            const lbl = document.createElement('div')
            lbl.className = 'label'
            lbl.innerHTML = '-'
            labels.appendChild(lbl)
            // value element
            const val = document.createElement('div')
            val.className = 'value'
            val.style.color = CLR(i)
            val.innerHTML = '0'
            values.appendChild(val)
            // draw line
            ctx.strokeStyle = CLR(i)
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(0, i * 60 + 30)
            ctx.lineTo(w, i * 60 + 30)
            ctx.stroke()
        }

        // old values
        let old = {}

        // calculate multiplier
        const mul = 30 / (rangeMax - rangeMin)

        this.update = input => {
            // shift canvas
            ctx.globalCompositeOperation = "copy"
            ctx.drawImage(ctx.canvas, -20, 0)
            ctx.globalCompositeOperation = "source-over"
            // for each input value
            Object.keys(input).forEach((label, index) => {
                // return overflowing parameter
                if(index > parametersCount) { return }
                // get value
                const value = input[label]
                // get elements
                const lbl = labels.children[index]
                const val = values.children[index]
                // set label
                if(lbl.innerHTML !== label) { lbl.innerHTML = label }
                // set value
                if(val.innerHTML !== value) { val.innerHTML = value }
                // draw value
                const a = (old[label] !== undefined ? old[label] : 0) * mul
                const b = value * mul
                // draw line
                ctx.strokeStyle = CLR(index)
                ctx.beginPath()
                ctx.moveTo(w - 20, (index * 60) + 30 - a)
                ctx.lineTo(w, (index * 60) + 30 - b)
                ctx.stroke()
            })
            // store history
            old = JSON.parse(JSON.stringify(input))
        }

        this.show = () => {
            this.element.style.display = ''
        }

        this.hide = () => {
            this.element.style.display = 'none'
        }

    }

}