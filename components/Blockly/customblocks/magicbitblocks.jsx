import * as Blockly from "blockly/core";
import { pythonGenerator } from "blockly/python";

// 1. Set Digital Pin
Blockly.Blocks['magicbit_set_digital'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Set Digital Pin")
      .appendField(new Blockly.FieldNumber(0), "PIN")
      .appendField(new Blockly.FieldDropdown([["High", "HIGH"], ["Low", "LOW"]]), "LEVEL");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_set_digital'] = block => {
  const pin = block.getFieldValue("PIN");
  const state = (block.getFieldValue("LEVEL") || block.getFieldValue("STATE")) === "HIGH" ? 1 : 0;
  pythonGenerator.definitions_['import_machine'] = 'from machine import Pin';
  return `Pin(${pin}, Pin.OUT).value(${state})\n`;
};

// 2. Set PWM Pin
Blockly.Blocks['magicbit_set_pwm'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Set PWM Pin")
      .appendField(new Blockly.FieldNumber(16), "PIN")
      .appendField("as")
      .appendField(new Blockly.FieldNumber(50), "VALUE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_set_pwm'] = block => {
  const pin = block.getFieldValue("PIN");
  const value = block.getFieldValue("VALUE");
  pythonGenerator.definitions_['import_machine_pwm'] = 'from machine import Pin, PWM';
  return `PWM(Pin(${pin})).duty(${value})\n`;
};

// 3. Set Servo
Blockly.Blocks['magicbit_set_servo'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Set Servo on Pin")
      .appendField(new Blockly.FieldNumber(15), "PIN")
      .appendField("Angle")
      .appendField(new Blockly.FieldNumber(90), "ANGLE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_set_servo'] = block => {
  const pin = block.getFieldValue("PIN");
  const angle = block.getFieldValue("ANGLE");
  pythonGenerator.definitions_['import_machine_pwm'] = 'from machine import Pin, PWM';
  return `PWM(Pin(${pin}), freq=50).duty(int(${angle} / 180 * 102 + 26))\n`;
};

// 4. Read Analog Pin
Blockly.Blocks['magicbit_read_analog'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Read Analog Pin")
      .appendField(new Blockly.FieldNumber(0), "PIN");
    this.setOutput(true, "Number");
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_read_analog'] = block => {
  const pin = block.getFieldValue("PIN");
  pythonGenerator.definitions_['import_machine_adc'] = 'from machine import ADC, Pin';
  return [`ADC(Pin(${pin})).read()`, pythonGenerator.ORDER_FUNCTION_CALL];
};


// 6. Read Button
Blockly.Blocks['magicbit_read_button'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Read Button")
      .appendField(new Blockly.FieldDropdown([["left", "left"], ["right", "right"]]), "BUTTON");
    this.setOutput(true, "Number");
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_read_button'] = block => {
  const button = block.getFieldValue("BUTTON");
  pythonGenerator.definitions_['import_machine_button'] = 'from machine import Pin';
  const pin = button === 'left' ? 5 : 15;
  return [`Pin(${pin}, Pin.IN).value()`, pythonGenerator.ORDER_FUNCTION_CALL];
};

// 7. Read Ultrasonic
Blockly.Blocks['magicbit_ultrasonic'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Read Ultrasonic at Pin")
      .appendField(new Blockly.FieldNumber(5), "PIN");
    this.setOutput(true, "Number");
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_ultrasonic'] = block => {
  const pin = block.getFieldValue("PIN");
  pythonGenerator.definitions_['import_time'] = 'import time';
  pythonGenerator.definitions_['import_machine_ultra'] = 'from machine import Pin\nimport machine';
  pythonGenerator.definitions_['ultrasonic_func_single_pin'] = `\ndef read_ultrasonic(pin_num):\n    try:\n        # Send trigger pulse\n        ULTRASOUND_PIN = Pin(pin_num, Pin.OUT)\n        ULTRASOUND_PIN.value(0)\n        time.sleep_us(2)\n        ULTRASOUND_PIN.value(1)\n        time.sleep_us(10)\n        ULTRASOUND_PIN.value(0)\n\n        # Switch to input to read echo\n        ULTRASOUND_PIN.init(Pin.IN)\n        duration = machine.time_pulse_us(ULTRASOUND_PIN, 1, 30000)  # max 30ms\n        distance_cm = (duration / 2) / 29.1\n        return round(distance_cm, 2)\n    except Exception as e:\n        print('Ultrasound read error:', e)\n        return None\n`;
  return [`read_ultrasonic(${pin})`, pythonGenerator.ORDER_FUNCTION_CALL];
};



// 9. NeoPixel RGB
Blockly.Blocks['magicbit_neopixel_rgb'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("NeoPixel Color R")
      .appendField(new Blockly.FieldNumber(100), "R")
      .appendField("G")
      .appendField(new Blockly.FieldNumber(100), "G")
      .appendField("B")
      .appendField(new Blockly.FieldNumber(100), "B")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};

pythonGenerator['magicbit_neopixel_rgb'] = block => {
  const r = block.getFieldValue("R");
  const g = block.getFieldValue("G");
  const b = block.getFieldValue("B");
  pythonGenerator.definitions_['import_neopixel'] = 'import neopixel\nfrom machine import Pin';
  return `np = neopixel.NeoPixel(Pin(13), 1)\nnp[0] = (${r}, ${g}, ${b})\nnp.write()\n`;
};

// 10. Display Text
Blockly.Blocks['magicbit_display_text'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Write")
      .appendField(new Blockly.FieldTextInput("Hello"), "TEXT")
      .appendField("on Display at")
      .appendField(new Blockly.FieldNumber(0), "X")
      .appendField(",")
      .appendField(new Blockly.FieldNumber(0), "Y");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_display_text'] = block => {
  const text = block.getFieldValue("TEXT");
  const x = block.getFieldValue("X");
  const y = block.getFieldValue("Y");
  pythonGenerator.definitions_['import_ssd1306'] = 'from ssd1306 import SSD1306_I2C\nfrom machine import I2C, Pin';
  pythonGenerator.definitions_['oled_obj'] = 'oled = SSD1306_I2C(128, 64, I2C(0, scl=Pin(22), sda=Pin(21)))';
  return `oled.text("${text}", ${x}, ${y})\noled.show()\n`;
};

// 11. Play Tone
Blockly.Blocks['magicbit_play_tone'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Play Tone")
      .appendField(new Blockly.FieldNumber(440), "FREQ")
      .appendField("Hz for")
      .appendField(new Blockly.FieldNumber(1), "DURATION")
      .appendField("seconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_play_tone'] = block => {
  const freq = block.getFieldValue("FREQ");
  const duration = block.getFieldValue("DURATION");
  pythonGenerator.definitions_['import_machine_tone'] = 'from machine import Pin, PWM';
  pythonGenerator.definitions_['import_time'] = 'import time';

  return `buzzer = PWM(Pin(25), freq=${freq}, duty=512)\ntime.sleep(${duration})\nbuzzer.deinit()\n`;
};


Blockly.Blocks['delay_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("delay")
      .appendField(new Blockly.FieldNumber(1000, 0), "DELAY")
      .appendField("s");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
    this.setTooltip("Delay execution for given seconds");
    this.setHelpUrl("");
  }
};

pythonGenerator['delay_block'] = function (block) {
  const delay = block.getFieldValue("DELAY");
  pythonGenerator.definitions_['import_time'] = 'import time';
  return `time.sleep(${delay})\n`;
};

// 13. Motor (Left/Right)
Blockly.Blocks['magicbit_motor'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Motor")
      .appendField(new Blockly.FieldDropdown([["Left", "LEFT"], ["Right", "RIGHT"]]), "SIDE")
      .appendField(new Blockly.FieldDropdown([["Forward", "FWD"], ["Backward", "BWD"]]), "DIR")
      .appendField("speed")
      .appendField(new Blockly.FieldNumber(0, 0, 1023, 1), "SPEED");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B51E0");
  }
};
pythonGenerator['magicbit_motor'] = block => {
  const side = block.getFieldValue('SIDE');
  const dir = block.getFieldValue('DIR');
  const speed = block.getFieldValue('SPEED');
  if (side === 'LEFT') {
    if (dir === 'BWD') {
      return `import machine\nM1_IN1 = machine.PWM(16, freq=1000)\nM1_IN2 = machine.PWM(17, freq=1000)\nM1_IN1.duty(${speed})\nM1_IN2.duty(0)\n`;
    } else {
      return `import machine\nM1_IN1 = machine.PWM(16, freq=1000)\nM1_IN2 = machine.PWM(17, freq=1000)\nM1_IN1.duty(0)\nM1_IN2.duty(${speed})\n`;
    }
  } else {
    if (dir === 'FWD') {
      return `import machine\nM2_IN1 = machine.PWM(18, freq=1000)\nM2_IN2 = machine.PWM(27, freq=1000)\nM2_IN1.duty(${speed})\nM2_IN2.duty(0)\n`;
    } else {
      return `import machine\nM2_IN1 = machine.PWM(18, freq=1000)\nM2_IN2 = machine.PWM(27, freq=1000)\nM2_IN1.duty(0)\nM2_IN2.duty(${speed})\n`;
    }
  }
};
