import React, { useState } from 'react';
import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

import './BlockMenu.css';
import "blockly/blocks";
const PARAM_TYPES = [
  { type: 'input_value', label: 'Add an input\nnumber or text', icon: '●', paramType: 'text' },
  { type: 'input_boolean', label: 'Add an input\nboolean', icon: '◆', paramType: 'boolean' },
  { type: 'label', label: 'Add a label', icon: 'text', paramType: 'label' }
];

const BlockMenu = ({ workspace, onBlockCreated, onClose }) => {
  const [blockName, setBlockName] = useState('');
  const [parameters, setParameters] = useState([]);
  const [runWithoutRefresh, setRunWithoutRefresh] = useState(false);

  const addParameter = (paramType) => {
    const newParam = {
      type: paramType,
      name: paramType === 'label' ? 'label' : 
            paramType === 'boolean' ? 'boolean' : 'input',
      id: Date.now() // Unique ID for each parameter
    };
    setParameters([...parameters, newParam]);
  };

  const updateParamName = (id, name) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, name } : p));
  };

  const removeParameter = (id) => {
    setParameters(parameters.filter(p => p.id !== id));
  };

  const handleOk = () => {
    // Sanitize block name: remove spaces, special chars, must start with letter/underscore
    let safeName = blockName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (!safeName || !/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(safeName)) {
      alert('Please enter a valid block name (letters, numbers, and underscores only, must start with a letter or underscore).');
      return;
    }
    if (!workspace) return;
    const defineType = `define_${safeName}`;
    // Register the call block
    Blockly.Blocks[safeName] = {
      init: function() {
        let input = this.appendDummyInput().appendField(safeName);
        parameters.forEach((param, idx) => {
          if (param.type === 'label') {
            this.appendDummyInput().appendField(param.name);
          } else if (param.type === 'boolean') {
            this.appendValueInput(param.name).setCheck('Boolean').appendField(param.name);
          } else {
            this.appendValueInput(param.name).setCheck(null).appendField(param.name);
          }
        });
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
      }
    };
    // Register the define block
    Blockly.Blocks[defineType] = {
      init: function() {
        let input = this.appendDummyInput().appendField('define').appendField(safeName);
        parameters.forEach((param, idx) => {
          if (param.type === 'label') {
            this.appendDummyInput().appendField(param.name);
          } else if (param.type === 'boolean') {
            this.appendValueInput(param.name).setCheck('Boolean').appendField(param.name);
          } else {
            this.appendValueInput(param.name).setCheck(null).appendField(param.name);
          }
        });
        this.appendStatementInput('STACK').appendField('');
        this.setColour(210);
      }
    };
    // Add to My Blocks flyout: define block at top, call block after button
    const toolbox = workspace.getToolbox();
    if (toolbox) {
      const myBlocksCategory = toolbox.getToolboxItems().find(cat => cat.name_ === 'My Blocks');
      if (myBlocksCategory) {
        const flyoutContents = myBlocksCategory.flyoutItems_ || [];
        const callBlockItem = { kind: 'block', type: safeName };
        const defineBlockItem = { kind: 'block', type: defineType };
        // Remove if already exists
        let filtered = flyoutContents.filter(item => !(item.kind === 'block' && (item.type === safeName || item.type === defineType)));
        // Insert define after button, call after define
        filtered.splice(1, 0, defineBlockItem);
        filtered.splice(2, 0, callBlockItem);
        myBlocksCategory.flyoutItems_ = filtered;
        toolbox.refreshSelection();
      }
    }
    // Add generator for call block (function call)
    pythonGenerator.forBlock[safeName] = function(block) {
      const args = parameters
        .filter(param => param.type !== 'label')
        .map(param => pythonGenerator.valueToCode(block, param.name, pythonGenerator.ORDER_NONE) || 'None');
      return `${safeName}(${args.join(', ')})\n`;
    };
    // Add generator for define block (function definition)
    pythonGenerator.forBlock[defineType] = function(block) {
      const args = parameters
        .filter(param => param.type !== 'label')
        .map(param => param.name);
      const branch = pythonGenerator.statementToCode(block, 'STACK');
      return `def ${safeName}(${args.join(', ')}):\n${branch || '    pass'}\n`;
    };
    onBlockCreated && onBlockCreated(safeName);
    onClose && onClose();
  };

  return (
    <div className="block-menu-overlay" onClick={onClose}>
      <div className="block-menu scratch-style" onClick={e => e.stopPropagation()}>
        <div className="block-menu-header scratch-header">
          <span>Make a Block</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="block-menu-content">
          <div className="scratch-block-preview">
            <span className="scratch-block-shape">
              <input
                className="scratch-block-name-input"
                value={blockName}
                onChange={e => setBlockName(e.target.value)}
                placeholder="block name"
              />
              {parameters.map((param) => (
                <span key={param.id} className={`scratch-block-param ${param.type}`}>
                  <input
                    value={param.name}
                    onChange={e => updateParamName(param.id, e.target.value)}
                    className="scratch-param-input"
                  />
                  <button 
                    className="remove-param-btn" 
                    onClick={() => removeParameter(param.id)}
                    title="Delete this parameter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </span>
          </div>
          <div className="scratch-param-buttons">
            {PARAM_TYPES.map(btn => (
              <button
                key={btn.type}
                className="scratch-param-btn"
                onClick={() => addParameter(btn.paramType)}
              >
                <span className="scratch-param-icon">{btn.icon}</span>
                <span className="scratch-param-label">{btn.label}</span>
              </button>
            ))}
          </div>
          <div className="block-menu-options">
            <label>
              <input
                type="checkbox"
                checked={runWithoutRefresh}
                onChange={e => setRunWithoutRefresh(e.target.checked)}
              />
              Run without screen refresh
            </label>
          </div>
          <div className="block-menu-actions">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
            <button 
              onClick={handleOk} 
              className="create-btn" 
              disabled={!blockName.trim()}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockMenu;