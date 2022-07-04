// signal io
#define UJS_CLNT 201 // UNO.js client version
#define PIN_MODE 202 // pinMode()
#define PIN_STAT 203 // digitalRead(), analogRead()
#define DT_WRITE 204 // digitalWrite()
#define AL_WRITE 205 // analogWrite()

// time
#define DLY_SCND 206 // delay()
#define DLY_MRSC 207 // delayMicroseconds()
#define TIM_MRSC 208 // micros()
#define TIM_MLSC 209 // millis()

#define SPR 254
#define END 255

int bytes[100];

void setup() {
  Serial.begin(1000000);
}

void loop() {
  // read all inputs
  readSerial();
  // select method
  if(bytes[0] == UJS_CLNT) {
    Serial.write(UJS_CLNT);
    sendPinStates();
    Serial.write(SPR);
    sendJSVersion();
    Serial.write(END);
  } else if(bytes[0] == PIN_STAT) {
    Serial.write(PIN_STAT);
    sendPinStates();
    Serial.write(SPR);
    Serial.write(END);
  } else if(bytes[0] == PIN_MODE) {
    Serial.write(PIN_MODE);
    setPinModes();
    sendPinStates();
    Serial.write(SPR);
    Serial.write(bytes[0] - 100);
    Serial.write(bytes[1]);
    Serial.write(bytes[2]);
    Serial.write(bytes[3]);
    Serial.write(bytes[4]);
    Serial.write(bytes[5]);
    Serial.write(bytes[6]);
    Serial.write(bytes[7]);
    Serial.write(bytes[8]);
    Serial.write(END);
  } else if(bytes[0] == DT_WRITE) {
    Serial.write(DT_WRITE);
    setDigitalWrite();
    sendPinStates();
    Serial.write(SPR);
    Serial.write(bytes[0] - 100);
    Serial.write(bytes[1]);
    Serial.write(bytes[2]);
    Serial.write(bytes[3]);
    Serial.write(bytes[4]);
    Serial.write(bytes[5]);
    Serial.write(bytes[6]);
    Serial.write(bytes[7]);
    Serial.write(bytes[8]);
    Serial.write(END);
  }
  // reset bytes
  bytes[0] = 0;
}

void readSerial() {
  // byte array index
  int i = 0;
  // while serial data available
  while(Serial.available() > 0) {
    bytes[i] = Serial.read();
    i += 1;
  }
}

void setDigitalWrite() {
  for(int i = 0; i < NUM_DIGITAL_PINS; i++) {
    if(bytes[i + 1] == 1) { digitalWrite(i, HIGH); }
    else if(bytes[i + 1] == 0) { digitalWrite(i, LOW); }
  }
}

void setPinModes() {
  for(int i = 0; i < NUM_DIGITAL_PINS; i++) {
    if(bytes[i + 1] == 1) { pinMode(i, INPUT); }
    else if(bytes[i + 1] == 0) { pinMode(i, OUTPUT); }
  }
}

void sendJSVersion() {
  // pins state flag
  Serial.write(1);
  Serial.write(0);
  Serial.write(0);
}

void sendPinStates() {
  // for each digital pin
  for(int i = 0; i < NUM_DIGITAL_PINS; i++) {
    Serial.write(digitalRead(i) == 1);
  }
  // separator flag
  Serial.write(SPR);
  // for each analog pin
  for(int i = 0; i < NUM_ANALOG_INPUTS; i++) {
    Serial.write(int(analogRead(i) / 5.12));
  }
}
