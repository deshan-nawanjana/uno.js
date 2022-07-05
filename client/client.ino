// signal io
#define UJS_CLNT 201 // UNO.js client version
#define PIN_MODE 202 // pinMode()
#define PIN_STAT 203 // digitalRead(), analogRead()
#define DT_WRITE 204 // digitalWrite()
#define AL_WRITE 205 // analogWrite()

// time
#define DLY_MLSC 206 // delay()
#define DLY_MRSC 207 // delayMicroseconds()
#define TIM_MLSC 208 // millis()
#define TIM_MRSC 209 // micros()

#define NTR 253 // neutral
#define SPR 254 // separator
#define END 255 // end

int index = 0;
int bytes[20];

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
  // select method type
  if(bytes[0] == UJS_CLNT) {
    Serial.write(UJS_CLNT);
    sendPinStates();
    Serial.write(SPR);
    sendJSVersion();
  } else if(bytes[0] == PIN_STAT) {
    Serial.write(PIN_STAT);
    sendPinStates();
  } else if(bytes[0] == PIN_MODE) {
    Serial.write(PIN_MODE);
    setPinModes();
    sendPinStates();
  } else if(bytes[0] == DT_WRITE) {
    Serial.write(DT_WRITE);
    setDigitalWrite();
    sendPinStates();
  } else if(bytes[0] == AL_WRITE) {
    Serial.write(AL_WRITE);
    setAnalogWrite();
    sendPinStates();
  } else if(bytes[0] == DLY_MLSC) {
    Serial.write(DLY_MLSC);
    setDelayMilliseconds();
    sendPinStates();
  } else if(bytes[0] == DLY_MRSC) {
    Serial.write(DLY_MRSC);
    setDelayMicroseconds();
    sendPinStates();
  } else if(bytes[0] == TIM_MLSC) {
    Serial.write(TIM_MLSC);
    sendPinStates();
    Serial.write(SPR);
    getMillis();
  } else if(bytes[0] == TIM_MRSC) {
    Serial.write(TIM_MRSC);
    sendPinStates();
    Serial.write(SPR);
    getMicros();
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
    if(bytes[i + 1] == 1) { pinMode(i, INPUT); }
    else if(bytes[i + 1] == 0) { pinMode(i, OUTPUT); }
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
    if(bytes[i + 1] == 1) { digitalWrite(i, HIGH); }
    else if(bytes[i + 1] == 0) { digitalWrite(i, LOW); }
  }
}

void setAnalogWrite() {
  for(int i = 0; i < NUM_DIGITAL_PINS - NUM_ANALOG_INPUTS; i++) {
    if(bytes[i + 1] != NTR) {
      int val = int(bytes[i + 1] * 1.275);
      analogWrite(i, val);
    }
  }
}

int getInt(int index) {
  // string to collect bytes
  String out = "0.00000000000000";
  // current byte index
  int cr_i = 1;
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
