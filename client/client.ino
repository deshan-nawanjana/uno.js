#include <Servo.h>
#include <Wire.h>
#include <ADXL345.h>
#include <SFE_BMP180.h>
#include <LiquidCrystal.h>

#define UNJS 201 // uno.js methods
#define VER_CLNT 0

#define BLTN 202 // built-in
#define PIN_STAT 0
#define PIN_MODE 1
#define DT_WRITE 2
#define AL_WRITE 3
#define DLY_MLSC 4
#define DLY_MRSC 5
#define TIM_MLSC 6
#define TIM_MRSC 7
#define ADV_TONE 8
#define ADV_NOTN 9
#define ADV_PLSI 10
#define ADV_PLSL 11

#define SN_1 212 // sensors pack #1
#define USS_READ 0
#define BPS_BEGN 10
#define BPS_READ 11

#define MD_1 222 // modules pack #1
#define SVR_ATCH 0
#define SVR_WRTE 1
#define SVR_READ 2
#define SVR_DTCH 3
#define ACL_POWR 10
#define ACL_READ 11
#define LCD_BEGN 20
#define LCD_CRSR 21
#define LCD_PRNT 22
#define LCD_CLER 23

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
  // get headers
  const int typ = bytes[0];
  const int mtd = bytes[1];
  // write response header
  Serial.write(typ);
  Serial.write(mtd);
  // select message type
  if(typ == UNJS) {
    if(mtd == VER_CLNT) { VER_CLNT_(); }
  } else if(typ == BLTN) {
    if(mtd == PIN_STAT) { PIN_STAT_(); } else
    if(mtd == PIN_MODE) { PIN_MODE_(); } else
    if(mtd == DT_WRITE) { DT_WRITE_(); } else
    if(mtd == AL_WRITE) { AL_WRITE_(); } else
    if(mtd == DLY_MLSC) { DLY_MLSC_(); } else
    if(mtd == DLY_MRSC) { DLY_MRSC_(); } else
    if(mtd == TIM_MLSC) { TIM_MLSC_(); } else
    if(mtd == TIM_MRSC) { TIM_MRSC_(); } else
    if(mtd == ADV_TONE) { ADV_TONE_(); } else
    if(mtd == ADV_NOTN) { ADV_NOTN_(); }
  } else if(typ == SN_1) {
    if(mtd == USS_READ) { USS_READ_(); } else
    if(mtd == BPS_BEGN) { BPS_BEGN_(); } else
    if(mtd == BPS_READ) { BPS_READ_(); }
  } else if(typ == MD_1) {
    if(mtd == SVR_ATCH) { SVR_ATCH_(); } else
    if(mtd == SVR_WRTE) { SVR_WRTE_(); } else
    if(mtd == SVR_READ) { SVR_READ_(); } else
    if(mtd == SVR_DTCH) { SVR_DTCH_(); } else
    if(mtd == ACL_POWR) { ACL_POWR_(); } else
    if(mtd == ACL_READ) { ACL_READ_(); } else
    
    if(mtd == LCD_BEGN) { LCD_BEGN_(); } else
    if(mtd == LCD_CRSR) { LCD_CRSR_(); } else
    if(mtd == LCD_PRNT) { LCD_PRNT_(); } else
    if(mtd == LCD_CLER) { LCD_CLER_(); }
  }
  // write response footer
  Serial.write(SPR);
  Serial.write(END);
}

// get value variables
String val_str = "0.00000000000000";
int val_int = 0;
float val_flt = 0;
// get value start index
int val_idx = 0;

void getValue(int index) {
  // start flag
  bool start = false;
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
      if(start == false) {
        val_idx = cr_i;
        start = true;
      }
      // put in string
      val_str[cr_c] = v;
      // increase char index
      cr_c++;
    }
    cr_i++;
  }
  // put end char
  val_str[cr_c] = '\0';
  // int version
  val_int = val_str.toInt();
  // float version
  val_flt = val_str.toFloat();
}

void PIN_STATE() {
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
  // separator flag
  Serial.write(SPR);
}

void VER_CLNT_() {
  PIN_STATE();
  Serial.write(3);
  Serial.write(1);
  Serial.write(22);
}

void PIN_STAT_() {
  PIN_STATE();
}

void PIN_MODE_() {
  int p = 0;
  for(int i = 2; bytes[i] != END; i++) {
    if(bytes[i] == SPR) {
      p += 1;
    } else {
      if(p == 0) { pinMode(bytes[i], OUTPUT); } else
      if(p == 1) { pinMode(bytes[i], INPUT); } else
      if(p == 2) { pinMode(bytes[i], INPUT_PULLUP); }
    }
  }
  PIN_STATE();
}

void DT_WRITE_() {
  int p = 0;
  for(int i = 2; bytes[i] != END; i++) {
    if(bytes[i] == SPR) {
      p += 1;
    } else {
      if(p == 0) { digitalWrite(bytes[i], LOW); } else
      if(p == 1) { digitalWrite(bytes[i], HIGH); }
    }
  }
  PIN_STATE();
}

void AL_WRITE_() {
  for(int i = 2; bytes[i] != END; i += 3) {
    analogWrite(bytes[i], int(bytes[i + 1] / 0.7843137254901961));
  }
}

void DLY_MLSC_() {
  getValue(0);
  delay(val_int);
  PIN_STATE();
}

void DLY_MRSC_() {
  getValue(0);
  delayMicroseconds(val_int);
  PIN_STATE();
}

void TIM_MLSC_() {
  PIN_STATE();
  Serial.print(millis());
}

void TIM_MRSC_() {
  PIN_STATE();
  Serial.print(micros());
}

void ADV_TONE_() {
  int pin = bytes[2];
  getValue(1);
  int frc = val_int;
  getValue(2);
  int dur = val_int;
  if(bytes[val_idx] != NTR) {
    tone(pin, frc, dur);
  } else {
    tone(pin, frc);
  }
  PIN_STATE();
}

void ADV_NOTN_() {
  noTone(bytes[2]);
  PIN_STATE();
}

Servo svr_arr[4];
int svr_pin[4] = {-1, -1, -1, -1};

int SVR_FIND_(int pin) {
  int idx = -1;
  for(int i = 0; i < 5; i += 1) {
    if(svr_pin[i] == pin) { idx = i; }
  }
  return idx;
}

void SVR_ATCH_() {
  for(int i = 0; i < 5; i += 1) {
    if(svr_pin[i] == -1) {
      svr_arr[i].attach(bytes[2]);
      svr_pin[i] = bytes[2];
      break;
    }
  }
  PIN_STATE();
}

void SVR_WRTE_() {
  int idx = SVR_FIND_(bytes[2]);
  if(idx != -1) { svr_arr[idx].write(bytes[3]); }
  PIN_STATE();
}

void SVR_READ_() {
  int idx = SVR_FIND_(bytes[2]);
  int val = 0;
  if(idx != -1) { val = svr_arr[idx].read(); }
  PIN_STATE();
  Serial.write(val);
}

void SVR_DTCH_() {
  int idx = SVR_FIND_(bytes[2]);
  if(idx != -1) {
    svr_arr[idx].detach();
    svr_pin[idx] = -1;
  }
  PIN_STATE();
}

ADXL345 adxl;
int adxl_x;
int adxl_y;
int adxl_z;

void ACL_POWR_() {
  adxl.powerOn();
  PIN_STATE();
}

void ACL_READ_() {
  adxl.readAccel(&adxl_x, &adxl_y, &adxl_z);
  PIN_STATE();
  Serial.print(adxl_x);
  Serial.write(SPR);
  Serial.print(adxl_y);
  Serial.write(SPR);
  Serial.print(adxl_z);
}

SFE_BMP180 pressure;

void BPS_BEGN_() {
  if(pressure.begin()){
    Serial.write(1);
  } else {
    Serial.write(0);
  }
}

void BPS_READ_() {
  PIN_STATE();
  // status char
  char status;
  // variables
  double T, P, p0;
  // provided altitude
  getValue(0);
  float alt = val_flt;
  // check temp status
  status = pressure.startTemperature();
  if(status != 0) {
    delay(status);
    status = pressure.getTemperature(T);
    if(status != 0) {
      // temperature in deg C
      Serial.print(T, 1);
      Serial.write(SPR);
      status = pressure.startPressure(3);
      if(status != 0) {
        delay(status);
        status = pressure.getPressure(P, T);
        if(status != 0) {
          // pressure measurement
          Serial.print(P);
          Serial.write(SPR);
          p0 = pressure.sealevel(P, alt);
          // relative (sea-level) pressure in hPa
          Serial.print(p0);
          Serial.write(SPR);
        } else {
          // return #3
          PrintNeutral();
          PrintNeutral();
        }
      } else {
        // return #3
        PrintNeutral();
        PrintNeutral();
      }
    } else {
      // return #2
      PrintNeutral();
      PrintNeutral();
      PrintNeutral();
    }
  } else {
    // return #1
    PrintNeutral();
    PrintNeutral();
    PrintNeutral();
  }
}

void PrintNeutral() {
  Serial.write(NTR);
  Serial.write(SPR);
}

void USS_READ_() {
  digitalWrite(bytes[2], LOW);
  delayMicroseconds(2);
  digitalWrite(bytes[2], HIGH);
  delayMicroseconds(10);
  digitalWrite(bytes[2], LOW);
  long duration = pulseIn(bytes[3], HIGH);
  PIN_STATE();
  Serial.print(duration);
}

LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

void LCD_BEGN_() {
  lcd.begin(bytes[2], bytes[3]);
}

void LCD_CRSR_() {
  lcd.setCursor(bytes[2], bytes[3]);
}

void LCD_PRNT_() {
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

void LCD_CLER_() {
  lcd.clear();
}
