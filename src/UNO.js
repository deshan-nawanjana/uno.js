// constants
window.LOW = 0
window.HIGH = 1
window.OUTPUT = 0
window.INPUT = 1
window.INPUT_PULLUP = 2
window.LED_BUILTIN = 13

window._UNO_ = {
    // current version and older versions
    VER : { CRR : '3.1.22', OLD : ['1.0.22', '1.1.22', '2.1.22'] }
}

window._UNO_.MSG = {
    // uno.js methods
    UNJS : {
        CODE : 201,
        VER_CLNT : 0    // client version
    },
    // built-in
    BLTN : {
        CODE : 202,
        PIN_STAT : 0,   // pin state for update()
        PIN_MODE : 1,   // pinMode()
        DT_WRITE : 2,   // digitalWrite()
        AL_WRITE : 3,   // analogWrite()
        DLY_MLSC : 4,   // delay()
        DLY_MRSC : 5,   // delayMicroseconds()
        TIM_MLSC : 6,   // millis()
        TIM_MRSC : 7,   // micros()
        ADV_TONE : 8,   // tone()
        ADV_NOTN : 9,   // noTone()
        ADV_PLSI : 10,  // pulseIn()
        ADV_PLSL : 11   // pulseInLong()
    },
    // sensors pack #1
    SN_1 : {
        CODE : 212,
        USS_READ : 0,   // unltrasonic pulseIn()
        BPS_BEGN : 10,  // pressure.begin()
        BPS_READ : 11   // pressure.getPressure()
    },
    // modules pack #1
    MD_1 : {
        CODE : 222,
        SVR_ATCH : 0,   // svr.attach()
        SVR_WRTE : 1,   // svr.write()
        SVR_READ : 2,   // svr.read()
        SVR_DTCH : 3,   // svr.detach()
        ACL_POWR : 10,  // adxl.powerOn()
        ACL_READ : 11,  // adxl.readAccel()
        LCD_BEGN : 20,  // lcd.begin()
        LCD_CRSR : 21,  // lcd.setCursor()
        LCD_PRNT : 22,  // lcd.print()
        LCD_CLER : 23   // lcd.clear()
    },
    // symbols
    NTR : 253, // neutral
    SPR : 254, // separator
    END : 255  // end
}

// color by index
window._UNO_.CLR = (i = 0) => {
    const colors = ['ff3300', '00cc99', '0066cc', '6666ff', 'ff66cc', 'ff9933']
    return '#' + colors[parseInt(i) % colors.length]
}

// log messages
window._UNO_.LOG = {
    VER : 'Please update the UNO.js client. System may not work properly.',
    NOT : 'Oops! Seems like UNO.js client is not installed in your controller.'
}

// temp data
window._UNO_.TMP = {}

// main scope
const UNO = {}