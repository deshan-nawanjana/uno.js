window._UNO_.HLP = {}

/*
    convert to given keys order
    put separator in middle spaces
    values larger than 200 will be converted to buffer
        [LOW, HIGH]
        [OUTPUT, INPUT, INPUT_PULLUP]
    usage
        pinMode()       => to OUTPUT | to INPUT | to INPUT_PULLUP
        digitalWrite()  => to LOW | to HIGH
*/

window._UNO_.HLP.keyGroup = (args, keysArray) => {
    // create output array
    let out = []
    // for each key
    for(let i = 0; i < keysArray.length; i++) {
        // current key
        const key = keysArray[i]
        // check input format
        if(args.length === 2 && args[1] === window[key]) {
            // single input
            out.push(args[0])
        } else if(typeof args[0] === 'object' && Array.isArray(args[0][key])) {
            // multiple inputs
            out = out.concat(args[0][key])
        }
        // push separator
        out.push(_UNO_.MSG.SPR)

    }
    // return output
    return out
}

/*
    convert to pattern group and multiply from array
    values larger than 200 will be converted to buffer
    put separator in middle spaces
        xA yB zC | xD yE zF | xG yH zI
    usage
        analogWrite()
*/

window._UNO_.HLP.typeGroup = (args, typeArray) => {
    // output array
    let out = []
    // check input format
    if(args.length > 1) {
        // for each type
        for(let i = 0; i < typeArray.length; i++) {
            // current type
            const type = typeArray[i]
            // check type format
            if(typeof type === 'number') {
                // number multiplier
                out.push(parseInt(args[i] * type))
            } else if(typeof type === 'string') {
                if(type === 'buffer') {
                    // text to buffer
                    out = out.concat(_UNO_.HLP.encodeText(args[i]))
                }
            }
        }
        // add separator
        out.push(_UNO_.MSG.SPR)
    } else if(typeof args[0] === 'object') {
        // get keys array
        const keys = Object.keys(args[0])
        // get values array
        const vals = Object.values(args[0])
        // for each key
        for(let k = 0; k < keys.length; k++) {
            // for type
            for(let i = 0; i < typeArray.length; i++) {
                // current type
                const type = typeArray[i]
                if(i === 0) {
                    out.push(parseInt(keys[k]))
                } else if(i === 1) {
                    if(typeof vals[k] === 'number') {
                        out.push(parseInt(vals[k] * type))
                    } else if(Array.isArray(vals[k])) {
                        out = out.concat(vals[k])
                    }
                }
            }
            // push separator
            out.push(_UNO_.MSG.SPR)
        }
    }
    // return output
    return out
}

window._UNO_.HLP.encodeText = text => {
    // convert to text
    text = text.toString()
    // create buffer
    const buffer = _UNO_.HLP.encodeText.encoder.encode(text)
    // return array
    return Array.from(buffer)
}

window._UNO_.HLP.encodeText.encoder = new TextEncoder()

window._UNO_.HLP.decodeText = array => {
    // create buffer
    const buffer = new Uint8Array(array)
    // return text
    return _UNO_.HLP.decodeText.decoder.decode(buffer)
}

window._UNO_.HLP.decodeText.decoder = new TextDecoder()

window._UNO_.HLP.encodeArray = (array, format) => {
    // output array
    let out = []
    for(let i = 0; i < array.length; i++) {
        if(typeof format[i] === 'number') {
            out.push(format[i] * array[i])
        } else if(format[i] === 'buffer') {
            out = out.concat(_UNO_.HLP.encodeText(array[i]))
        }
        // push separator
        out.push(_UNO_.MSG.SPR)
    }
    // return output
    return out
}

window._UNO_.HLP.decodeArray = (array, format) => {
    for(let i = 0; i < array.length; i++) {
        if(typeof format[i] === 'number') {
            array[i] = parseInt(array[i] * format[idx])
        } else if(format[i] === 'buffer') {
            array[i] = _UNO_.HLP.decodeText(array[i])
        }
    }
    return array
}

window._UNO_.HLP.showUnsupported = () => {
    // create elemnt
    const tray = document.createElement('div')
    tray.className = 'unojs-error-tray'
    // add inner element
    tray.innerHTML = `
        <div class="unojs-error-inner">
            <div class="unojs-error-info">
                Unfortunately, your browser does not support Web Serial API
                to continue with uno.js.
                Please read the
                <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/serial#browser_compatibility" target="_blank">
                    browser compatibility details
                </a> in MDN Docs.
            </div>
            <div class="unojs-error-button">CLOSE</div>
        </div>
    `
    // close event
    tray.querySelector('.unojs-error-button').addEventListener('click', () => {
        tray.style.opacity = 0
        setTimeout(() => {
            tray.outerHTML = ''
            if(document.body) { document.body.style.overflow = '' }
        }, 300)
    })
    // append to page
    if(document.body) {
        // hide body overflow
        document.body.style.overflow = 'hidden'
        document.body.appendChild(tray)
    } else {
        document.documentElement.append(tray)
    }
    setTimeout(() => tray.style.opacity = 1, 10)
}