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

pythonGenerator['keyboard_when_key_pressed'] = function(block) {
  const key = block.getFieldValue("KEY");
  const statements = pythonGenerator.statementToCode(block, 'DO');
  if (!pythonGenerator.keyboardEventHandlers) {
    pythonGenerator.keyboardEventHandlers = {};
  }
  const body = (statements && statements.trim().length > 0) ? statements : '  pass\n';
  pythonGenerator.keyboardEventHandlers[key] = `def key_${key}_pressed():\n${body.endsWith('\n') ? body : body + '\n'}`;
  return '';
};

