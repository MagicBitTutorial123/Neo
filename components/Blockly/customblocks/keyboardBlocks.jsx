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
  if (!pythonGenerator.eventHandlers_) pythonGenerator.eventHandlers_ = [];
  pythonGenerator.eventHandlers_.push(`#Event Handlers\ndef key_${key}_pressed():\n${statements || '  pass'}\n`);
  return '';
};

