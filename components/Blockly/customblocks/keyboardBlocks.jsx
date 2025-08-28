import * as Blockly from "blockly/core";
import { pythonGenerator } from "blockly/python";

Blockly.Blocks['keyboard_when_key_pressed'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("when")
      .appendField(new Blockly.FieldDropdown([
        ["Up", "up"],
        ["Down", "down"],
        ["Left", "left"],
        ["Right", "right"]
      ]), "KEY")
      .appendField("arrow key pressed");
    this.appendStatementInput("DO")
      .setCheck(null);
    this.setColour("#D96AC2");
    this.setTooltip("Handle arrow key press");
    this.setHelpUrl("");
    this.setDeletable(true);
    this.setMovable(true);
    this.setNextStatement(false);
    this.setPreviousStatement(false);
  }
};

Blockly.Blocks['keyboard_when_custom_key_pressed'] = {
  init: function () {
    this.appendDummyInput()
      .appendField("when")
      .appendField(new Blockly.FieldTextInput("a"), "CUSTOM_KEY")
      .appendField("key pressed");
    this.appendStatementInput("DO")
      .setCheck(null);
    this.setColour("#D96AC2");
    this.setTooltip("Handle custom key press (e.g., 'a', 'space', '1')");
    this.setHelpUrl("");
    this.setDeletable(true);
    this.setMovable(true);
    this.setNextStatement(false);
    this.setPreviousStatement(false);
  }
};

pythonGenerator['keyboard_when_key_pressed'] = function(block) {
  const key = block.getFieldValue("KEY");
  const statements = pythonGenerator.statementToCode(block, 'DO');
  if (!pythonGenerator.keyboardEventHandlers) {
    pythonGenerator.keyboardEventHandlers = {};
  }
  
  // Always ensure stop_all function is defined
  if (!pythonGenerator.keyboardEventHandlers['stop_all']) {
    pythonGenerator.keyboardEventHandlers['stop_all'] = `def key_stop_all_pressed():
    global M1_IN1, M1_IN2, M2_IN1, M2_IN2
    M1_IN1.duty(1)
    M1_IN2.duty(1) 
    M2_IN1.duty(1)
    M2_IN2.duty(1)
    await asyncio.sleep(0.05)
`;
  }
  
  const body = (statements && statements.trim().length > 0) ? statements : '  pass\n';
  pythonGenerator.keyboardEventHandlers[key] = `def key_${key}_pressed():
  global M1_IN1, M1_IN2, M2_IN1, M2_IN2
${body.endsWith('\n') ? body : body + '\n'}`;
  return '';
};

pythonGenerator['keyboard_when_custom_key_pressed'] = function(block) {
  const customKey = block.getFieldValue("CUSTOM_KEY").toLowerCase().trim();
  const statements = pythonGenerator.statementToCode(block, 'DO');
  if (!pythonGenerator.keyboardEventHandlers) {
    pythonGenerator.keyboardEventHandlers = {};
  }
  
  // Always ensure stop_all function is defined
  if (!pythonGenerator.keyboardEventHandlers['stop_all']) {
    pythonGenerator.keyboardEventHandlers['stop_all'] = `def key_stop_all_pressed():
    global M1_IN1, M1_IN2, M2_IN1, M2_IN2
    M1_IN1.duty(0)
    M1_IN2.duty(0) 
    M2_IN1.duty(0)
    M2_IN2.duty(0)
`;
  }
  
  // Convert special key names to standard format
  let keyName = customKey;
  if (customKey === ' ' || customKey === 'space') {
    keyName = 'space';
  } else if (customKey === 'enter' || customKey === 'return') {
    keyName = 'enter';
  } else if (customKey === 'shift') {
    keyName = 'shift';
  } else if (customKey === 'ctrl' || customKey === 'control') {
    keyName = 'ctrl';
  } else if (customKey === 'alt') {
    keyName = 'alt';
  } else if (customKey.length === 1) {
    // Single character keys (a-z, 0-9, etc.)
    keyName = customKey;
  } else {
    // For other keys, use as-is but make safe for function names
    keyName = customKey.replace(/[^a-zA-Z0-9]/g, '_');
  }
  
  const body = (statements && statements.trim().length > 0) ? statements : '  pass\n';
  pythonGenerator.keyboardEventHandlers[keyName] = `def key_${keyName}_pressed():
  global M1_IN1, M1_IN2, M2_IN1, M2_IN2
${body.endsWith('\n') ? body : body + '\n'}`;
  return '';
};

