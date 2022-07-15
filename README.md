# uno.js - JavaScript Library for Arduino

Integrate Arduino technology into JavaScript is the main concept of uno.js. This library communicate with the microcontroller that has connected to your PC and reads values from sensors and modules to do any kind of calculation in web environment.

## Installation

To use uno.js properly, you have to install uno.js client program to your microcontroller first. Read [this page](https://uno.dnjs.info/docs/#getting_started/setup_your_controller.html) of the documentation to upload now or select suitable HEX file and flash it by yourself. Once you have succesfully installed the client application, there is no requirement of installing anything to your Arduino microcontroller otherwise if you change your uno.js version.

- [arduino_uno.hex](dist/client_hex/arduino_uno.hex)
- [arduino_mega.hex](dist/client_hex/arduino_mega.hex)
- [arduino_nano.hex](dist/client_hex/arduino_nano.hex)

Then download the latest version of uno.js library using [this link](dist/uno.min.js) and attach to your web application.

```HTML
<script src="path/to/file/uno.min.js"></script>
```

## First Program

Let's blink an LED using uno.js.

```JavaScript
// create controller
const myBoard = new UNO.Controller()

// blink function
const blink = async function() {
    // init controller
    await myBoard.init()
    // set pin mode
    await myBoard.pinMode(13, OUTPUT)
    // loop forever
    while(true) {
        // turn on led and delay
        await myBoard.digitalWrite(13, HIGH)
        await myBoard.delay(300)
        // turn off led and delay
        await myBoard.digitalWrite(13, LOW)
        await myBoard.delay(200)
    }
}

// click on window to start
window.addEventListener('click', blink)
```

## Documentation

Read uno.js documentation to undrstand the library quickly. Each page of the documentation contains a program to test. Threfore, connect your microcontroller that has uploaded the client app and continue.

- [Getting Started](https://uno.dnjs.info/docs/#getting_started/introduction.html)
- [Basics](https://uno.dnjs.info/docs/#basics/init_loop_and_stop.html)
- [Modules](https://uno.dnjs.info/docs/#modules/accelerometer.html)
- [Sensors](https://uno.dnjs.info/docs/#sensors/ultrasonic_sensor.html)
- [Tools](https://uno.dnjs.info/docs/#tools/uploader.html)
- [Utils](https://uno.dnjs.info/docs/#utils/start_button.html)

### Developed by Deshan Nawanjana

[DNJS](https://dnjs.info/) | [LinkedIn](https://www.linkedin.com/in/deshan-nawanjana/) | [GitHub](https://github.com/deshan-nawanjana) | [YouTube](https://www.youtube.com/channel/UCfqOF8_UTa6LhaujoFETqlQ) | [Blogger](https://dn-w.blogspot.com/) | [Facebook](https://www.facebook.com/mr.dnjs) | [Gmail](mailto:deshan.uok@gmail.com)