"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import blocksTabIcon from "@/assets/blocksTabIcon.svg";
import codingIcon from "@/assets/codingIcon.svg";
import dashboardIcon from "@/assets/dashboardIcon.svg";
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
import Image from "next/image";

import AIChatbot from "./chatbot";

Blockly.setLocale(En);

export default function Playground() {
  const [activeTab, setActiveTab] = useState("Blocks");
  const [generatedCode, setGeneratedCode] = useState("");
  const workspaceRef = useRef(null);
  const [expandMenu, setexpandMenu] = useState(false);
  const blocklyDivRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);

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
    <pattern id="blocklyGridPattern" patternUnits="userSpaceOnUse" width="200" height="200">
      <!-- Fill background -->
      <rect width="200" height="200" fill="white" />
      
      <!-- Light grid (20px spacing) -->
      <path d="
        M 20 0 L 20 200
        M 40 0 L 40 200
        M 60 0 L 60 200
        M 80 0 L 80 200
        M 100 0 L 100 200
        M 120 0 L 120 200
        M 140 0 L 140 200
        M 160 0 L 160 200
        M 180 0 L 180 200
        M 0 20 L 200 20
        M 0 40 L 200 40
        M 0 60 L 200 60
        M 0 80 L 200 80
        M 0 100 L 200 100
        M 0 120 L 200 120
        M 0 140 L 200 140
        M 0 160 L 200 160
        M 0 180 L 200 180
      " stroke="#ddd" stroke-width="1" />

      <!-- Bold grid every 10 cells (200px) -->
      <path d="M 0 0 L 0 200 M 200 0 L 200 200 M 0 0 L 200 0 M 0 200 L 200 200" stroke="#ddd" stroke-width="2" />
    </pattern>
  </defs>
  `;
    document.body.appendChild(svgDefs);
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

    window.addEventListener("beforeunload", () => {
      if (workspaceRef.current) {
        const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlText = Blockly.Xml.domToText(xml);
        localStorage.setItem("blocklyWorkspace", xmlText);
      }
    });
  }, []);

  useEffect(() => {
    const blocklyBgDiv = document.querySelector(".blocklyMainBackground");
    if (blocklyBgDiv) {
      blocklyBgDiv.addEventListener("click", () => {
        if (expandMenu) {
          setexpandMenu(false);
          setSelectedCategory("");
          console.log("closing");
        }
      });
    }
    const rows = document.querySelectorAll(".blocklyTreeRow");
    rows.forEach((row) => {
      let clickTimeout;
      row.addEventListener("click", () => {
        if (clickTimeout) return;
        clickTimeout = setTimeout(() => (clickTimeout = null), 1000); // 300ms throttle

        console.log("clicked");
        const clickedCategoryId = row.getAttribute("id");

        if (selectedCategory === clickedCategoryId) {
          setSelectedCategory("");
        } else {
          setSelectedCategory(clickedCategoryId);
        }

        rows.forEach((r) => {
          r.classList.remove("selected-category");
          const icon = r.querySelector(".blocklyToolboxCategoryIcon");
          if (icon) icon.classList.remove("selected-category");
        });

        row.classList.add("selected-category");
        const icon = row.querySelector(".blocklyToolboxCategoryIcon");
        if (icon) icon.classList.add("selected-category");

        const color = row.getAttribute("data-colour");
        row.style.setProperty("--selected-category-color", color || "#2196f3");
      });
    });
  }, [expandMenu, activeTab, selectedCategory]);

  useEffect(() => {
    if (selectedCategory && !expandMenu) {
      setexpandMenu(true);
    }
  }, [expandMenu, selectedCategory]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
   
    .blocklyMainBackground {
      fill: url(#blocklyGridPattern) !important;
      display: flex;
    }
  .blocklyToolboxDiv {
 
  min-width: 70px !important;
  max-height: 90vh !important;
  padding: 2rem 0.25rem 0.15rem 0.25rem !important;
  background-color: #CCE4FF !important;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem !important;
  border-radius: 45px !important;
  box-sizing: border-box;
  margin-left: 25px !important;
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
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
  border-radius: 48px !important;
}


/* Highlight background for selected toolbox category row */
.blocklyTreeRow.selected-category {
  background-color:#FFFFFF !important; 
  border-radius: 12px !important;
  padding: 4px 0 !important;
}



/* === Category Icon Wrapper === */
.blocklyToolboxCategory {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  padding: 0.05rem 0 !important;
}

.blocklyContinuousToolbox .blocklyContinuousCategoryIcon {
  stroke: none !important;
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}


/* === Highlight Selected Icon === */
.blocklyToolboxCategoryIcon.selected-category {
  background-color: var(--selected-category-color, #2196f3) !important;
  border: 3px solid white !important; /* highlight ring */
  box-shadow: 0 0 0 2px var(--selected-category-color, #2196f3) !important; 
}


/* === Category Label (Text) === */
.blocklyTreeLabel {
  font-size: 12px !important;
  margin-top: 0.25rem;
  text-align: center;
  color: black !important;
  font-weight: 550 !important;
}

/* === Selected Category Label === */
.blocklyTreeRow.blocklyTreeSelected .blocklyTreeLabel {
  color: black !important;
  display: ${expandMenu ? "block" : "none"} !important;
 
}

/* === Optional: Flyout Visibility Control via expandMenu === */
.blocklyFlyout {
  display: ${expandMenu ? "block" : "none"} !important;
}

.blocklyFlyoutScrollbar {
  display: ${expandMenu ? "block" : "none"} !important;
}
  .blocklyFlyoutBackground {
  fill: #ffffffff !important; 
  fill-opacity: 1 !important;
}

.blocklyFlyout {
  margin-left: 35px !important;
  max-height: 100vh !important;   
  top: 4vh !important;        
  overflow-y: auto !important; 
    
}

.blocklyFlyoutScrollbar {
  margin-left: 35px !important;
}

 `;
    document.head.appendChild(style);
  }, [selectedCategory, expandMenu, activeTab]);

  useEffect(() => {
    if (!blocklyDivRef.current) return;

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
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
      },
      media: "https://unpkg.com/blockly/media/",
      flyoutGap: 110,
    });

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
    });

    return () => {
      workspace.dispose();
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Blocks") {
      setWorkspaceInitialized(false);
      if (workspaceRef.current) {
        const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
        const xmlText = Blockly.Xml.domToText(xml);
        localStorage.setItem("blocklyWorkspace", xmlText);
      }
    } else {
      if (workspaceRef.current && !workspaceInitialized) {
        const savedState = localStorage.getItem("blocklyWorkspace");
        if (savedState) {
          try {
            const xml = Blockly.utils.xml.textToDom(savedState);
            Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspaceRef.current);
            setWorkspaceInitialized(true);
          } catch (e) {
            console.error("Error restoring workspace:", e);
          }
        } else {
          setWorkspaceInitialized(true);
        }
      }
    }
  }, [activeTab]);

  const updateWorkspace = (el) => {
    const workspace = Blockly.inject(el, {
      toolbox: toolboxConfig,
      scrollbars: true,
      renderer: "zelos",
      theme: Blockly.Themes.Zelos,
      trashcan: true,
      zoom: {
        controls: false,
        wheel: true,
        startScale: 1,
      },
      media: "https://unpkg.com/blockly/media/",
    });
    workspaceRef.current = workspace;

    // const savedState = localStorage.getItem("blocklyWorkspace");
    // if (savedState) {
    //   try {
    //     const xml = Blockly.utils.xml.textToDom(savedState);
    //     Blockly.Xml.domToWorkspace(xml, workspace);
    //   } catch (e) {
    //     console.error("Error restoring workspace:", e);
    //   }
    // }

    // workspace.addChangeListener(() => {
    //   const xml = Blockly.Xml.workspaceToDom(workspace);
    //   const xmlText = Blockly.Xml.domToText(xml);
    //   localStorage.setItem("blocklyWorkspace", xmlText);
    //   console.log("Workspace updated and saved to localStorage");

    // });
  };

  return (
    <>
      <div className="min-h-[96vh] bg-white flex flex-row">
        <SideNavbar />
        <div
          className="relative gap-3px mx-3 my-2 rounded-3xl border border-blue-200 bg-white w-full flex min-h-[98vh]"
          style={{ borderRadius: "48px" }}
        >
          <div className="absolute top-0 right-4 m-2 flex flex-row items-center gap-4 z-20 ">
            <button
              onClick={() => setActiveTab("Blocks")}
              className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150
              ${
                activeTab === "Blocks"
                  ? "bg-white border border-blue-400 text-black shadow-sm"
                  : "bg-blue-100 border border-transparent text-blue-800 hover:bg-blue-200"
              } rounded-l-[9999px] rounded-r-none`}
              style={{ minWidth: 120 }}
            >
              <Image src={blocksTabIcon} alt="Blocks" className="w-5 h-5" />
              <span className="ml-1 font-bold">Blocks</span>
            </button>
            <AIChatbot />
            <button
              onClick={() => {
                setActiveTab("Code");
                const code = pythonGenerator.workspaceToCode(
                  workspaceRef.current
                );
                setGeneratedCode(code);
              }}
              className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150
      ${
        activeTab === "Code"
          ? "bg-white border-blue-400 text-blue-900 shadow-sm"
          : "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
      } rounded-none`}
              style={{ minWidth: 120 }}
            >
              <Image src={codingIcon} alt="Code" className="w-5 h-5" />
              <span className="ml-1 font-bold">Code</span>
            </button>

            <button
              onClick={() => setActiveTab("Dashboard")}
              className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150
      ${
        activeTab === "Dashboard"
          ? "bg-white border-blue-400 text-blue-900 shadow-sm"
          : "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
      } rounded-r-full`}
              style={{ minWidth: 120 }}
            >
              <Image src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />
              <span className="ml-1 font-bold">Dashboard</span>
            </button>
          </div>
          <div className="  pb-4 pr-0.5 relative z-5 flex-grow w-full">
            {activeTab === "Blocks" && (
              <div
                ref={(el) => {
                  if (!el) return;
                  if (!workspaceInitialized) {
                    updateWorkspace(el);
                    setWorkspaceInitialized(true);
                  }
                }}
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
                options={{
                  readOnly: true,
                  padding: { top: 20, bottom: 20, left: 20, right: 20 },
                }}
              />
            )}
            {activeTab === "Dashboard" && (
              <div className="flex justify-center items-center h-full text-2xl text-blue-800 font-bold">
                Dashboard Coming Soon!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
