#include<Servo.h>
#include <Wire.h>
#include <ADXL345.h>
#include <LiquidCrystal.h>

// =========== 201 - common methods ===========
#define CAT_CMMN 201

// signal io
#define UJS_CLNT 0 // UNO.js client version
#define PIN_MODE 1 // pinMode()
#define PIN_STAT 2 // digitalRead(), analogRead()
#define DT_WRITE 3 // digitalWrite()
#define AL_WRITE 4 // analogWrite()

// time
#define DLY_MLSC 5 // delay()
#define DLY_MRSC 6 // delayMicroseconds()
#define TIM_MLSC 7 // millis()
#define TIM_MRSC 8 // micros()

// =========== 202 - sensors methods ===========
#define CAT_SNSR 202

// unltrasonic sensor
#define USS_READ 0 // pulse in to read duration

// =========== 203 - modules methods ===========
#define CAT_MODS 203

// servor motor
#define SVR_ATCH 0 // svr.attach()
#define SVR_WRTE 1 // svr.write()

// accelerometer
#define ACL_POWR 10 // adxl.powerOn()
#define ACL_READ 11 // adxl.readAccel()

#define LCD_BEGN 20 // lcd.begin()
#define LCD_CRSR 21 // lcd.setCursor()
#define LCD_PRNT 22 // lcd.print()
#define LCD_CLER 23 // lcd.clear()

// =========== signal identifiers ===========

#define NTR 253 // neutral
#define SPR 254 // separator
#define END 255 // end

int index = 0;
int bytes[100];

void setup() {
  Serial.begin(2000000);
}

void loop() {
  // current byte value
  int data = 0;
  // wait while input data
  while(Serial.available() == 0) {}
  // reset index
  index = 0;
  // read all input data
  while(Serial.available() > 0 || data != END) {
    if(Serial.available() > 0) {
      // get current value
      data = Serial.read();
      // asign to bytes array
      bytes[index] = data;
      // increase index
      index++;
    }
  }

  // select category
  if(bytes[0] == CAT_CMMN) {
    // common
    Serial.write(CAT_CMMN);
    if(bytes[1] == UJS_CLNT) {
      Serial.write(UJS_CLNT);
      sendPinStates();
      Serial.write(SPR);
      sendJSVersion();
    } else if(bytes[1] == PIN_STAT) {
      Serial.write(PIN_STAT);
      sendPinStates();
      Serial.write(SPR);
      sendJSVersion();
    } else if(bytes[1] == PIN_MODE) {
      Serial.write(PIN_MODE);
      setPinModes();
      sendPinStates();
    } else if(bytes[1] == DT_WRITE) {
      Serial.write(DT_WRITE);
      setDigitalWrite();
      sendPinStates();
    } else if(bytes[1] == AL_WRITE) {
      Serial.write(AL_WRITE);
      setAnalogWrite();
      sendPinStates();
    } else if(bytes[1] == DLY_MLSC) {
      Serial.write(DLY_MLSC);
      setDelayMilliseconds();
      sendPinStates();
    } else if(bytes[1] == DLY_MRSC) {
      Serial.write(DLY_MRSC);
      setDelayMicroseconds();
      sendPinStates();
    } else if(bytes[1] == TIM_MLSC) {
      Serial.write(TIM_MLSC);
      sendPinStates();
      Serial.write(SPR);
      getMillis();
    } else if(bytes[1] == TIM_MRSC) {
      Serial.write(TIM_MRSC);
      sendPinStates();
      Serial.write(SPR);
      getMicros();
    }
  } else if(bytes[0] == CAT_SNSR) {
    // sensors
    Serial.write(CAT_SNSR);
    if(bytes[1] == USS_READ) {
      Serial.write(TIM_MRSC);
      sendPinStates();
      Serial.write(SPR);
      getUltrasonicDuration();
    }
  } else if(bytes[0] == CAT_MODS) {
    // devices
    Serial.write(CAT_MODS);
    if(bytes[1] == SVR_ATCH) {
      Serial.write(SVR_ATCH);
      sendPinStates();
      setServoAttach();
    } else if(bytes[1] == SVR_WRTE) {
      Serial.write(SVR_WRTE);
      sendPinStates();
      setServoWrite();
    } else if(bytes[1] == ACL_POWR) {
      Serial.write(ACL_POWR);
      sendPinStates();
      accelerometerPowerOn();
    } else if(bytes[1] == ACL_READ) {
      Serial.write(ACL_READ);
      sendPinStates();
      Serial.write(SPR);
      accelerometerReadAccel();
    } else if(bytes[1] == LCD_BEGN) {
      Serial.write(LCD_BEGN);
      sendPinStates();
      Serial.write(SPR);
      LCDBegin();
    } else if(bytes[1] == LCD_CRSR) {
      Serial.write(LCD_CRSR);
      sendPinStates();
      Serial.write(SPR);
      LCDSetCursor();
    } else if(bytes[1] == LCD_PRNT) {
      Serial.write(LCD_PRNT);
      sendPinStates();
      Serial.write(SPR);
      LCDPrint();
    } else if(bytes[1] == LCD_CLER) {
      Serial.write(LCD_CLER);
      sendPinStates();
      Serial.write(SPR);
      LCDClear();
    }
  }
  // write end of message
  separateEnd();
}

void separateEnd() {
    Serial.write(SPR);
    Serial.write(END);
}

void sendJSVersion() {
  // pins state flag
  Serial.write(1);
  Serial.write(0);
  Serial.write(22);
}

void setPinModes() {
  for(int i = 0; i < NUM_DIGITAL_PINS - NUM_ANALOG_INPUTS; i++) {
    if(bytes[i + 2] == 0) { pinMode(i, OUTPUT); }
    else if(bytes[i + 2] == 1) { pinMode(i, INPUT); }
    else if(bytes[i + 2] == 2) { pinMode(i, INPUT_PULLUP); }
  }
}

void sendPinStates() {
  // for each digital pin
  for(int i = 0; i < NUM_DIGITAL_PINS - NUM_ANALOG_INPUTS; i++) {
    Serial.write(digitalRead(i) == 1);
  }
  // separator flag
  Serial.write(SPR);
  // for each analog pin
  for(int i = 0; i < NUM_ANALOG_INPUTS; i++) {
    Serial.write(int(analogRead(i) / 5.115));
  }
}

void setDigitalWrite() {
  for(int i = 0; i < NUM_DIGITAL_PINS - NUM_ANALOG_INPUTS; i++) {
    if(bytes[i + 2] == 1) { digitalWrite(i, HIGH); }
    else if(bytes[i + 2] == 0) { digitalWrite(i, LOW); }
  }
}

void setAnalogWrite() {
  for(int i = 0; i < NUM_DIGITAL_PINS - NUM_ANALOG_INPUTS; i++) {
    if(bytes[i + 2] != NTR) {
      int val = int(bytes[i + 2] * 1.275);
      analogWrite(i, val);
    }
  }
}

int getInt(int index) {
  // string to collect bytes
  String out = "0.00000000000000";
  // current byte index
  int cr_i = 2;
  // current value index
  int cr_v = 0;
  // current char index
  int cr_c = 0;
  // while finds end char
  while(bytes[cr_i] != END) {
    // get current byte
    int v = bytes[cr_i];
    // check value is separator
    if(v == SPR) {
      // increase value index
      cr_v++;
    } else if(cr_v == index) {
      // put in string
      out[cr_c] = v;
      // increase char index
      cr_c++;
    }
    cr_i++;
  }
  // put end char
  out[cr_c] = '\0';
  // return int version
  return out.toInt();
}

void setDelayMilliseconds() {
  int value = getInt(0);
  delay(value);
}

void setDelayMicroseconds() {
  int value = getInt(0);
  delayMicroseconds(value);
}

void getMillis() {
  Serial.print(millis());
}

void getMicros() {
  Serial.print(micros());
}

void getUltrasonicDuration() {
  int trig = bytes[2];
  int echo = bytes[3];
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  Serial.print(pulseIn(echo, HIGH));
}

Servo svr_motor;

void setServoAttach() {
  if(svr_motor.attached() == false) {
    svr_motor.attach(bytes[2]);
  }
}

void setServoWrite() {
  svr_motor.write(bytes[2]);
}

ADXL345 adxl;
int adxl_x;
int adxl_y;
int adxl_z;

void accelerometerPowerOn() {
  adxl.powerOn();
}

void accelerometerReadAccel() {
  adxl.readAccel(&adxl_x, &adxl_y, &adxl_z);
  Serial.print(adxl_x);
  Serial.write(SPR);
  Serial.print(adxl_y);
  Serial.write(SPR);
  Serial.print(adxl_z);
}

LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

void LCDBegin() {
  lcd.begin(bytes[2], bytes[3]);
}

void LCDSetCursor() {
  lcd.setCursor(bytes[2], bytes[3]);
}

void LCDPrint() {
  // length value
  int len = 0;
  // while reach end
  while(bytes[len + 2] != END) {
    len++;
  }
  // create string
  char value[len];
  // for loop
  for(int i = 0; i < len; i++) {
    value[i] = bytes[i + 2];
  }
  // print on lcd
  lcd.print(value);
}

void LCDClear() {
  lcd.clear();
}
