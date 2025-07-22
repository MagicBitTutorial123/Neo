"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
// import blocksTabIcon from "public/blocksTabIcon.svg";
// import codingIcon from "public/codingIcon.svg";
// import dashboardIcon from "public/dashboardIcon.svg";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as En from "blockly/msg/en";
import {
  ContinuousToolbox,
  ContinuousMetrics,
  ContinuousFlyout,
} from "@blockly/continuous-toolbox";
import "blockly/javascript";
import { pythonGenerator } from "blockly/python";
import Editor from "@monaco-editor/react";
import "@/components/Blockly/customblocks/magicbitblocks";
import "@/components/Blockly/customblocks/keyboardBlocks";
import SideNavbar from "@/components/SideNavbar";
// import AIChatbot from "./chatbot";

Blockly.setLocale(En);

export default function Playground() {
  const [activeTab, setActiveTab] = useState("Blocks");
  const [generatedCode, setGeneratedCode] = useState("");
  const workspaceRef = useRef(null);
  const [expandMenu, setexpandMenu] = useState(false);
  const blocklyDivRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const toolboxConfig = useMemo(() => ({
    kind: "categoryToolbox",

    contents: [
      {
        kind: "category",
        name: "Motion",
        colour: "#4A90E2",
        id: "cat_motion",
        expanded: expandMenu,

        contents: [
          { kind: "block", type: "motion_move_steps" },
          { kind: "block", type: "motion_turn_right" },
          { kind: "block", type: "motion_turn_left" },
        ],
      },
      {
        kind: "category",
        name: "Magicbit",
        colour: "#9B51E0",
        id: "cat_magicbit",
        expanded: expandMenu,

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
        colour: "#D96AC2",
        id: "cat_keyboard",
        expanded: expandMenu,

        contents: [{ kind: "block", type: "keyboard_when_key_pressed" }],
      },
      {
        kind: "category",
        name: "Logic",
        colour: "#F2C94C",
        id: "cat_logic",
        expanded: expandMenu,

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
        colour: "#F2994A",
        id: "cat_loops",
        expanded: expandMenu,

        contents: [
          {
            kind: "block",
            type: "controls_repeat_ext",
            inputs: {
              TIMES: { shadow: { type: "math_number", fields: { NUM: 10 } } },
            },
          },
          { kind: "block", type: "controls_whileUntil" },
          {
            kind: "block",
            type: "controls_for",
            inputs: {
              FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } },
              TO: { shadow: { type: "math_number", fields: { NUM: 10 } } },
              BY: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            },
          },
          { kind: "block", type: "controls_forEach" },
          { kind: "block", type: "controls_flow_statements" },
        ],
      },
      {
        kind: "category",
        name: "Math",
        colour: "#56CCF2",
        id: "cat_math",
        expanded: expandMenu,

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
        colour: "#6FCF97",
        id: "cat_text",

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
        colour: "#F2994A",
        id: "cat_variables",
        custom: "VARIABLE",
        expanded: expandMenu,
      },
      {
        kind: "category",
        name: "Functions",
        colour: "#EB5757",
        id: "cat_functions",
        custom: "PROCEDURE",
        expanded: expandMenu,
      },
    ],
  }));

  useEffect(() => {
    const svgDefs = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgDefs.setAttribute("style", "height:0;width:0;position:absolute");
    svgDefs.innerHTML = `
    <defs>
      <pattern id="blocklyGridPattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" stroke-width="1" />
      </pattern>
    </defs>
  `;
    document.body.appendChild(svgDefs);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
   
    .blocklyMainBackground {
      fill: url(#blocklyGridPattern) !important;
      border-radius: 999px;
    }
    .blocklyToolboxDiv {
      width: 6% !important;
      height: 700px !important;
      padding:2rem 0.5rem 0.5rem 0.5rem !important;
      padding-top:2rem;
      background-color : #CCE4FF !important;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border-top-right-radius: 40px;
      border-bottom-right-radius: 40px;
  
    }
   
  .blocklyTreeRow {
  background: transparent !important;
  border-radius: 0 !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0.25rem 0 !important;
  box-shadow: none !important;
}

/* === Selected Row Background Override === */
.blocklyTreeRow.blocklyTreeSelected {
  background-color: transparent !important;
  box-shadow: none !important;
}

/* === Extra Class When We Add "selected-category" on Click === */
.blocklyTreeRow.selected-category {
  background-color: transparent !important;
}
 

/* === Category Icon Wrapper === */
.blocklyToolboxCategory {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  padding: 0.25rem 0 !important;
}

/* === Toolbox Category Icons (Circle Button) === */
.blocklyToolboxCategory .blocklyToolboxCategoryIcon {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  background-color: transparent !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  transition: all 0.2s ease;
  box-shadow: none !important;
  border: 3px solid transparent !important; /* <- for highlight ring */
}

/* === Highlight Selected Icon === */
.blocklyToolboxCategoryIcon.selected-category {
  background-color: var(--selected-category-color, #2196f3) !important;
  border: 3px solid white !important; /* highlight ring */
  box-shadow: 0 0 0 2px var(--selected-category-color, #2196f3) !important; /* outer ring */
}


/* === Category Label (Text) === */
.blocklyTreeLabel {
  font-size: 12px !important;
  margin-top: 0.25rem;
  text-align: center;
  display: block;
  color: black !important;
}

/* === Selected Category Label === */
.blocklyTreeRow.blocklyTreeSelected .blocklyTreeLabel {
  color: black !important;
}
      
}

  `;
    document.head.appendChild(style);
    const rows = document.querySelectorAll(".blocklyTreeRow");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const clickedCategoryId = row.getAttribute("id");

        // If the same category is clicked again -> collapse
        if (selectedCategory === clickedCategoryId) {
          setexpandMenu(false);
          setSelectedCategory(""); // no selected
        } else {
          setexpandMenu(true);
          setSelectedCategory(clickedCategoryId);
        }

        // Remove from all rows and icons
        rows.forEach((r) => {
          r.classList.remove("selected-category");
          const icon = r.querySelector(".blocklyToolboxCategoryIcon");
          if (icon) icon.classList.remove("selected-category");
        });

        // Add to clicked row and icon
        row.classList.add("selected-category");
        const icon = row.querySelector(".blocklyToolboxCategoryIcon");
        if (icon) icon.classList.add("selected-category");

        // Optional: Set CSS var
        const color = row.getAttribute("data-colour");
        row.style.setProperty("--selected-category-color", color || "#2196f3");
      });
    });
  }, [expandMenu]);

  useEffect(() => {
    if (!blocklyDivRef.current) return;
    // Register plugins
    if (
      !Blockly.registry.hasItem(
        Blockly.registry.Type.TOOLBOX,
        "ContinuousToolbox"
      )
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
    //variable click
    if (!Blockly.registry.hasItem("toolboxCategory", "VARIABLE")) {
      Blockly.registry.register("toolboxCategory", "VARIABLE", (workspace) => {
        return Blockly.Variables.flyoutCategory(workspace);
      });
    }

    //variable function
    if (!Blockly.registry.hasItem("toolboxCategory", "PROCEDURE")) {
      Blockly.registry.register("toolboxCategory", "PROCEDURE", (workspace) => {
        return Blockly.Procedures.flyoutCategory(workspace);
      });
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

    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: toolboxConfig,
      plugins: {
        flyoutsVerticalToolbox: "ContinuousFlyout",
        metricsManager: "ContinuousMetrics",
        toolbox: "ContinuousToolbox",
      },
      scrollbars: true,
      renderer: "zelos",
      theme: Blockly.Themes.Zelos,
      trashcan: false,
      grid: true,
      zoom: {
        controls: false,
        wheel: true,
        startScale: 1,
      },
      media: "https://unpkg.com/blockly/media/",
    });

    // Add event listener to hide flyout when clicking on canvas
    setTimeout(() => {
      const mainBg = blocklyDivRef.current?.querySelector('.blocklyMainBackground');
      if (mainBg) {
        mainBg.addEventListener('mousedown', () => {
          if (workspace.getToolbox()) {
            workspace.getToolbox().clearSelection();
            setSelectedCategory("");
            setexpandMenu(false);
          }
        });
      }
    }, 500);

    workspaceRef.current = workspace;

    const savedState = localStorage.getItem("blocklyWorkspace");
    if (savedState) {
      try {
        const xml = Blockly.utils.xml.textToDom(savedState);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error("Error restoring workspace:", e);
      }
    }

    workspace.addChangeListener(() => {
      const code = pythonGenerator.workspaceToCode(workspace);
      setGeneratedCode(code);
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem("blocklyWorkspace", xmlText);
    });

    return () => {
      workspace.dispose();
    };
  }, []);

  return (
    <div className="flex">
    <div className="bg-white flex flex-row w-full ">
      <SideNavbar/>
      <div
        className="w-full mx-6 my-2 rounded-3xl border border-blue-200 bg-white overflow-hidden flex min-h-[96.5vh]"
        style={{ borderRadius: "48px" }}
        >
        <div className="absolute top-5 right-10 m-2 flex items-center gap-2 z-20">
          {["Blocks", "Code", "Dashboard"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm border transition-colors duration-150
                ${
                  activeTab === tab
                    ? "bg-white border-blue-400 text-blue-900 shadow-sm"
                    : "bg-blue-100 border-transparent text-blue-800 hover:bg-blue-200"
                }
              `}
              style={{
                minWidth: 120,
                boxShadow:
                  activeTab === tab
                    ? "0 2px 8px 0 rgba(0,0,0,0.04)"
                    : undefined,
              }}
            >
              {tab === "Blocks" && <img src="blocksTabIcon.svg" alt="Blocks" className="w-5 h-5" />}
              {tab === "Code" && <img src="codingIcon.svg" alt="Code" className="w-5 h-5" />}
              {tab === "Dashboard" && <img src="dashboardIcon.svg" alt="Dashboard" className="w-5 h-5" />}
              <span className="ml-1 font-bold text-black">{tab}</span>
            </button>
          ))}
        </div>

        <div className="pl-0.4 pt-1 pb-4 pr-0.5 relative z-5 flex-grow w-full">
          {activeTab === "Blocks" && (
            <div
              ref={blocklyDivRef}
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "white",
              }}
            />
          )}
          {activeTab === "Code" && (
            <Editor
              height="90vh"
              defaultLanguage="python"
              value={generatedCode}
              theme="vs-light"
              options={{ readOnly: true }}
            />
          )}

          {activeTab === "Dashboard" && (
            <div className="flex justify-center items-center h-full text-2xl text-blue-800 font-bold">
              Dashboard Coming Soon!
            </div>
          )}
        </div>
      </div>

      {/* <AIChatbot position="right" /> */}
    </div>
    </div>
  );
}
