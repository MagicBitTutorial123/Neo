import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import { pythonGenerator } from "blockly/python";
import * as En from "blockly/msg/en";
import {
  ContinuousToolbox,
  ContinuousMetrics,
  ContinuousFlyout,
} from "@blockly/continuous-toolbox";
import "blockly/javascript";
import Editor from "@monaco-editor/react";
import BlockMenu from "./BlockMenu";
// import AI from "./AI";
// import "../App.css";
import "./customblocks/magicbitblocks";
import "./customblocks/keyboardBlocks";
import { Menu, X } from "lucide-react";
import { FaFolder, FaCode, FaTachometerAlt } from "react-icons/fa";
Blockly.setLocale(En);

// Register plugins
if (
  !Blockly.registry.hasItem(Blockly.registry.Type.TOOLBOX, "ContinuousToolbox")
) {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    "ContinuousToolbox",
    ContinuousToolbox
  );
}
if (
  !Blockly.registry.hasItem(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics"
  )
) {
  Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER,
    "ContinuousMetrics",
    ContinuousMetrics
  );
}
if (
  !Blockly.registry.hasItem(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout"
  )
) {
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    "ContinuousFlyout",
    ContinuousFlyout
  );
}

// Motion blocks
Blockly.Blocks["motion_move_steps"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("move")
      .appendField(new Blockly.FieldNumber(10), "STEPS")
      .appendField("steps");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4A90E2");
    this.setTooltip("Move forward a number of steps.");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["motion_turn_right"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("turn right")
      .appendField(new Blockly.FieldAngle(90), "ANGLE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4A90E2");
    this.setTooltip("Turn right by angle.");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["motion_turn_left"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("turn left")
      .appendField(new Blockly.FieldAngle(90), "ANGLE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4A90E2");
    this.setTooltip("Turn left by angle.");
    this.setHelpUrl("");
  },
};

pythonGenerator["motion_move_steps"] = function (block) {
  const steps = block.getFieldValue("STEPS");
  return `move_forward(${steps})\n`;
};

pythonGenerator["motion_turn_right"] = function (block) {
  const angle = block.getFieldValue("ANGLE");
  return `turn_right(${angle})\n`;
};

pythonGenerator["motion_turn_left"] = function (block) {
  const angle = block.getFieldValue("ANGLE");
  return `turn_left(${angle})\n`;
};

const BlocklyComponent = ({
  generatedCode,
  setGeneratedCode,
  workspaceRef,
  portRef,
}) => {
  const blocklyDiv = useRef(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [toolboxCollapsed, setToolboxCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Blocks");

  const toolboxConfig = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Motion",
        colour: "#4C97FF",
        contents: [
          { kind: "block", type: "motion_move_steps" },
          { kind: "block", type: "motion_turn_right" },
          { kind: "block", type: "motion_turn_left" },
        ],
      },
      {
        kind: "category",
        name: "magicbit",
        colour: "#FF8000",
        contents: [
          { kind: "block", type: "magicbit_set_digital" },
          { kind: "block", type: "magicbit_set_pwm" },
          { kind: "block", type: "magicbit_set_servo" },
          { kind: "block", type: "magicbit_read_analog" },
          { kind: "block", type: "magicbit_touch" },
          { kind: "block", type: "magicbit_read_button" },
          { kind: "block", type: "magicbit_ultrasonic" },
          { kind: "block", type: "magicbit_read_humidity" },
          { kind: "block", type: "magicbit_neopixel_rgb" },
          { kind: "block", type: "magicbit_display_text" },
          { kind: "block", type: "magicbit_play_tone" },
          { kind: "block", type: "magicbit_clear_display" },
          { kind: "block", type: "delay_block" },
        ],
      },
      {
        kind: "category",
        name: "Keyboard",
        colour: "#FF33CC",
        contents: [
          { kind: "block", type: "keyboard_when_key_pressed" },
          // { kind: "block", type: "keyboard_get_key" },
        ],
      },

      {
        kind: "category",
        name: "Logic",
        colour: "%{BKY_LOGIC_HUE}",
        contents: [
          { kind: "block", type: "controls_if" },
          { kind: "block", type: "logic_compare" },
          { kind: "block", type: "logic_operation" },
          { kind: "block", type: "logic_negate" },
          { kind: "block", type: "logic_boolean" },
          { kind: "block", type: "logic_null" },
          { kind: "block", type: "logic_ternary" },
        ],
      },
      {
        kind: "category",
        name: "Loops",
        colour: "%{BKY_LOOPS_HUE}",
        contents: [
          {
            kind: "block",
            type: "controls_repeat_ext",
            inputs: {
              TIMES: {
                shadow: {
                  type: "math_number",
                  fields: { NUM: 10 },
                },
              },
            },
          },
          { kind: "block", type: "controls_whileUntil" },
          {
            kind: "block",
            type: "controls_for",
            inputs: {
              FROM: {
                shadow: { type: "math_number", fields: { NUM: 1 } },
              },
              TO: {
                shadow: { type: "math_number", fields: { NUM: 10 } },
              },
              BY: {
                shadow: { type: "math_number", fields: { NUM: 1 } },
              },
            },
          },
          { kind: "block", type: "controls_forEach" },
          { kind: "block", type: "controls_flow_statements" },
        ],
      },
      {
        kind: "category",
        name: "Math",
        colour: "%{BKY_MATH_HUE}",
        contents: [
          { kind: "block", type: "math_number", fields: { NUM: 123 } },
          { kind: "block", type: "math_arithmetic" },
          { kind: "block", type: "math_single" },
          { kind: "block", type: "math_round" },
          { kind: "block", type: "math_on_list" },
          { kind: "block", type: "math_modulo" },
        ],
      },
      {
        kind: "category",
        name: "Text",
        colour: "%{BKY_TEXTS_HUE}",
        contents: [
          { kind: "block", type: "text" },
          { kind: "block", type: "text_join" },
          { kind: "block", type: "text_length" },
          { kind: "block", type: "text_print" },
        ],
      },
      {
        kind: "category",
        name: "Variables",
        colour: "%{BKY_VARIABLES_HUE}",
        custom: "VARIABLE",
      },
      {
        kind: "category",
        name: "Functions",
        colour: "%{BKY_PROCEDURES_HUE}",
        custom: "PROCEDURE",
      },
      {
        kind: "category",
        name: "My Blocks",
        colour: "#4C97FF",
        contents: [
          {
            kind: "button",
            text: "Make a Block",
            callbackKey: "MAKE_A_BLOCK",
          },
        ],
      },
    ],
  };

  const handleBlockCreated = (blockName) => {
    console.log(`Block "${blockName}" created successfully!`);
  };

  const handleCreateBlock = () => {
    setShowBlockMenu(true);
  };
  
  //toggle
  const toggleToolbox = () => {
    const workspace = workspaceRef.current;
    if (workspace) {
      const flyout = workspace.getFlyout();
      if (flyout) {
        if (toolboxCollapsed) {
          flyout.setVisible(true);
          setToolboxCollapsed(false);
        } else {
          flyout.setVisible(false);
          setToolboxCollapsed(true);
        }
        setTimeout(() => workspace.resize(), 50);
      }
    }
  };


  useEffect(() => {
    if (!blocklyDiv.current) return;

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolboxConfig,
      plugins: {
        flyoutsVerticalToolbox: "ContinuousFlyout",
        metricsManager: "ContinuousMetrics",
        toolbox: "ContinuousToolbox",
      },
      scrollbars: true,
      horizontalLayout: false,
      toolboxPosition: "start",
      renderer: "zelos",
      theme: Blockly.Themes.Zelos,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      media: "https://unpkg.com/blockly/media/",
    });

    workspaceRef.current = workspace;

    const savedState = localStorage.getItem("blocklyWorkspace");
    if (savedState) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedState);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Error loading saved workspace:", e);
      }
    }

    const onChange = () => {
      // Reset event handler collection
      pythonGenerator.eventHandlers_ = [];
      // Generate main code
      let code = pythonGenerator.workspaceToCode(workspace);
      // Append all event handlers at the end
      if (pythonGenerator.eventHandlers_ && pythonGenerator.eventHandlers_.length > 0) {
        code += '\n' + pythonGenerator.eventHandlers_.join('\n');
      }
      setGeneratedCode(code);

      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem("blocklyWorkspace", xmlText);
    };

    workspace.addChangeListener(onChange);

    Blockly.getMainWorkspace()?.registerButtonCallback(
      "MAKE_A_BLOCK",
      handleCreateBlock
    );

    return () => {
      workspace.removeChangeListener(onChange);
      workspace.dispose();
    };
  }, []);

  return (
  <div style={{ position: "relative", height: "100vh", backgroundColor: "#f0f8ff" }}>
    
    {/* Tabs aligned right - updated to match Playground.jsx */}
    <div
      className="absolute top-0 right-0 m-2 flex items-center gap-2 z-20"
    >
      {["Blocks", "Code", "Dashboard"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded font-semibold text-sm ${
            activeTab === tab ? "bg-blue-100 text-blue-900" : "bg-transparent text-blue-700"
          }`}
          style={{ minWidth: 100 }}
        >
          {tab === "Blocks" && <FaFolder />}
          {tab === "Code" && <FaCode />}
          {tab === "Dashboard" && <FaTachometerAlt />}
          {tab}
        </button>
      ))}
    </div>

    {/* Blockly Workspace */}
    <div
      style={{
        display: activeTab === "Blocks" ? "block" : "none",
        height: "100%",
        position: "relative",
      }}
    >
      <button
        onClick={toggleToolbox}
        style={{
          position: "absolute",
          top: 10,
          left: toolboxCollapsed ? 180 : 350,
          zIndex: 1000,
          background: "#4a5568",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {toolboxCollapsed ? <Menu size={16} /> : <X size={16} />}
      </button>

      <div
        ref={blocklyDiv}
        style={{
          height: "100%",
          backgroundColor: "#fff", // Ensure white background for Blockly workspace
        }}
      />
    </div>

    {/* Code View */}
    {activeTab === "Code" && (
      <div style={{ height: "100%" }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={generatedCode}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    )}

    {/* Dashboard View */}
    {activeTab === "Dashboard" && (
      <div
        style={{
          padding: 20,
          height: "100%",
          color: "#333",
        }}
      >
        <h2>Dashboard</h2>
        <p>Custom dashboard coming soon.</p>
      </div>
    )}

    {/* AI Chat Button */}
    <button
      onClick={() => setShowAIChat(!showAIChat)}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 999,
        backgroundColor: "#4f8cff",
        color: "white",
        padding: "10px 16px",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      {showAIChat ? "Hide Chat" : "Ask AI"}
    </button>

    {showAIChat && (
      <div
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 400,
          height: 500,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 999,
        }}
      >
        <AI workspaceRef={workspaceRef} />
      </div>
    )}

    {/* Block creator panel */}
    {showBlockMenu && (
      <BlockMenu
        workspace={workspaceRef.current}
        onBlockCreated={handleBlockCreated}
        onClose={() => setShowBlockMenu(false)}
      />
    )}
  </div>
);

};


export default BlocklyComponent;