"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import blocksTabIcon from "@/assets/blocksTabIcon.svg";
import codingIcon from "@/assets/codingIcon.svg";
import dashboardIcon from "@/assets/dashboardIcon.svg";
import * as Blockly from "blockly";
import "blockly/javascript";
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
import AIChatbot from "@/components/AI/chatbot";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";

Blockly.setLocale(En);

export default function BlocklyComponent({ generatedCode, setGeneratedCode }) {
  // Sidebar context
  const { sidebarCollapsed } = useSidebar();
  
  // State management
  const [activeTab, setActiveTab] = useState("Blocks");
  const [expandMenu, setExpandMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [latestAnalogByPin, setLatestAnalogByPin] = useState({});
  const [latestDigitalByPin, setLatestDigitalByPin] = useState({});
  const [widgetData, setWidgetData] = useState({});
  const [sensorHistory, setSensorHistory] = useState({});

  const workspaceRef = useRef(null);

  // Constants
  const ANALOG_PINS = [
    0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33,
    34, 35, 36, 39,
  ];
  const DIGITAL_PINS = [
    0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33,
  ];

  // Utility functions
  const removeWidget = (id) =>
    setWidgets((prev) => prev.filter((w) => w.id !== id));

  const updateWidgetProps = (id, prop, value) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? { ...widget, props: { ...widget.props, [prop]: value } }
          : widget
      )
    );
  };

  useEffect(() => {
    console.log(latestAnalogByPin);
  },[latestAnalogByPin])


  // Toolbox configuration
  const toolboxConfig = useMemo(
    () => ({
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Magicbit",
          colour: "#9B51E0",
          id: "cat_magicbit",
          contents: [
            { kind: "block", type: "magicbit_set_digital" },
            { kind: "block", type: "magicbit_set_pwm" },
            { kind: "block", type: "magicbit_set_servo" },
            { kind: "block", type: "magicbit_motor" },
            { kind: "block", type: "magicbit_read_analog" },
            { kind: "block", type: "magicbit_read_button" },
            { kind: "block", type: "magicbit_ultrasonic" },
            { kind: "block", type: "magicbit_neopixel_rgb" },
            { kind: "block", type: "magicbit_play_tone" },
            { kind: "block", type: "delay_block" },
          ],
        },
        {
          kind: "category",
          name: "Keyboard",
          colour: "#FF33CC",
          contents: [{ kind: "block", type: "keyboard_when_key_pressed" }],
        },
        {
          kind: "category",
          name: "Logic",
          colour: "#F2C94C",
          id: "cat_logic",
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
        },
        {
          kind: "category",
          name: "Functions",
          colour: "#EB5757",
          id: "cat_functions",
          custom: "PROCEDURE",
        },
      ],
    }),
    []
  );

  // Initialize Blockly plugins and SVG definitions
  useEffect(() => {
    // Create SVG pattern for grid
    const svgDefs = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgDefs.setAttribute("style", "height:0;width:0;position:absolute");
    svgDefs.innerHTML = `
      <defs>
        <pattern id="blocklyGridPattern" patternUnits="userSpaceOnUse" width="200" height="200">
          <rect width="200" height="200" fill="white" />
          <path d="
            M 20 0 L 20 200 M 40 0 L 40 200 M 60 0 L 60 200 M 80 0 L 80 200
            M 100 0 L 100 200 M 120 0 L 120 200 M 140 0 L 140 200 M 160 0 L 160 200
            M 180 0 L 180 200 M 0 20 L 200 20 M 0 40 L 200 40 M 0 60 L 200 60
            M 0 80 L 200 80 M 0 100 L 200 100 M 0 120 L 200 120 M 0 140 L 200 140
            M 0 160 L 200 160 M 0 180 L 200 180
          " stroke="#ddd" stroke-width="1" />
          <path d="M 0 0 L 0 200 M 200 0 L 200 200 M 0 0 L 200 0 M 0 200 L 200 200" 
                stroke="#ddd" stroke-width="2" />
        </pattern>
      </defs>
    `;
    document.body.appendChild(svgDefs);

    // Register Blockly plugins
    const plugins = [
      {
        type: Blockly.registry.Type.TOOLBOX,
        name: "ContinuousToolbox",
        class: ContinuousToolbox,
      },
      {
        type: Blockly.registry.Type.METRICS_MANAGER,
        name: "ContinuousMetrics",
        class: ContinuousMetrics,
      },
      {
        type: Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
        name: "ContinuousFlyout",
        class: ContinuousFlyout,
      },
    ];

    plugins.forEach(({ type, name, class: pluginClass }) => {
      if (!Blockly.registry.hasItem(type, name)) {
        Blockly.registry.register(type, name, pluginClass);
      }
    });

    // Register toolbox categories
    if (!Blockly.registry.hasItem("toolboxCategory", "VARIABLE")) {
      Blockly.registry.register("toolboxCategory", "VARIABLE", (workspace) =>
        Blockly.Variables.flyoutCategory(workspace)
      );
    }

    if (!Blockly.registry.hasItem("toolboxCategory", "PROCEDURE")) {
      Blockly.registry.register("toolboxCategory", "PROCEDURE", (workspace) =>
        Blockly.Procedures.flyoutCategory(workspace)
      );
    }

    return () => {
      if (document.body.contains(svgDefs)) {
        document.body.removeChild(svgDefs);
      }
    };
  }, []);

  // Handle category selection and UI interactions
  useEffect(() => {
    if (activeTab !== "Blocks") return;

    const handleMainBackgroundClick = () => {
      setExpandMenu(false);
      setSelectedCategory("");
    };

    const blocklyBgDiv = document.querySelector(".blocklyMainBackground");
    if (blocklyBgDiv) {
      blocklyBgDiv.addEventListener("click", handleMainBackgroundClick);
    }

    // Handle category row clicks
    const rows = document.querySelectorAll(".blocklyTreeRow");
    const clickHandlers = [];

    rows.forEach((row, index) => {
      const handleClick = (e) => {
        e.stopPropagation();
        console.log("Category clicked:", row.getAttribute("id"));

        const clickedCategoryId = row.getAttribute("id");

        if (selectedCategory === clickedCategoryId) {
          setSelectedCategory("");
          setExpandMenu(false);
          console.log("Closing flyout");
        } else {
          setSelectedCategory(clickedCategoryId);
          setExpandMenu(true);
          console.log("Opening flyout for:", clickedCategoryId);
        }
      };

      row.addEventListener("click", handleClick);
      clickHandlers.push({ element: row, handler: handleClick });
    });

    return () => {
      if (blocklyBgDiv) {
        blocklyBgDiv.removeEventListener("click", handleMainBackgroundClick);
      }
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
    };
  }, [activeTab, selectedCategory]);

  // Apply dynamic styles for Blocks tab
  useEffect(() => {
    if (activeTab !== "Blocks") return;

    // Calculate sidebar width and toolbox position
    const sidebarWidth = 120;
    const toolboxLeftMargin = sidebarWidth -100; 

    const style = document.createElement("style");
    style.id = "blockly-dynamic-styles";
    style.innerHTML = `
      .blocklyMainBackground {
        fill: url(#blocklyGridPattern) !important;
        border-radius: 999px;
      }

      

      .blocklyToolboxDiv {
        width: 70px !important;
        min-width: 70px !important;
        max-width: 70px !important;

        height: auto !important;
        max-height: 90vh !important;
        overflow: visible !important;
        position: fixed !important;
        z-index: 100 !important;
        margin-top: 0.5rem !important;
        margin-left: ${toolboxLeftMargin}px !important;
        padding: 1.5rem 0.25rem !important;
        background-color: #CCE4FF !important;
        display: flex !important;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem !important;
        border-radius: 45px !important;
        position: absolute !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
      }
    
    .blocklyToolboxCategory {
      transition: all 0.2s ease-in-out;
    }
    
    .blocklyToolboxCategory:hover {
      background-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    

    .blocklyToolboxCategoryIcon {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
      flex-shrink: 0 !important;
    }

    .blocklyTreeRow {
      background: transparent !important;
      border-radius: 48px !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      margin: 0.25rem 0 !important;
      transition: all 0.2s ease-in-out;
    }
    
    .blocklyToolboxCategoryLabel {
      opacity: 1 !important;
      visibility: visible !important;
      color: #222E3A !important;
      font-weight: 500 !important;
    }

    .blocklyTreeRow.selected-category {
      background-color: #FFFFFF !important;
      border-radius: 12px !important;
      padding: 4px 0 !important;
    }

    .blocklyToolboxCategory {
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      padding: 0.05rem 0 !important;
      transition: all 0.2s ease-in-out;
    }

    .blocklyToolboxCategoryIcon.selected-category {
      background-color: var(--selected-category-color, #2196f3) !important;
      border: 3px solid white !important;
      box-shadow: 0 0 0 2px var(--selected-category-color, #2196f3) !important;
      
    }

    .blocklyTreeLabel {
      font-size: 12px !important;
      margin-top: 0.25rem;
      text-align: center;
      color: black !important;
      font-weight: 550 !important;
      display: block !important;
    }

    .blocklyFlyout {
      margin-left: 35px !important;
      max-height: 80vh !important;
      top: 4vh !important;
      overflow: hidden !important;
      width: 280px !important;
      transition: all 0.3s ease-in-out;
    }

    .blocklyFlyout .blocklyBlockCanvas {
      transform: scale(0.7) !important;
      transform-origin: 0 0 !important;
    }

    .blocklyFlyoutBackground {
      fill: #ffffff !important;
      fill-opacity: 1 !important;
      transition: all 0.3s ease-in-out;
    }

    .blocklyFlyoutScrollbar {
      display: ${expandMenu ? "block" : "none"} !important;
      margin-left: 35px !important;
    }

    .blocklyMainWorkspaceScrollbar {
      display: none !important;
    }

    .blocklyFlyout ::-webkit-scrollbar {
      display: none !important;
    }

    .blocklyFlyout {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }

    .blocklyDragging {
      cursor: grabbing !important;
    }

    .blocklyDragging .blocklyBlock {
      pointer-events: none !important;
    }

    .blocklyToolboxCategory:hover {
      background-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .blocklyToolboxCategory:hover .blocklyTreeLabel {
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById("blockly-dynamic-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [activeTab, sidebarCollapsed]);

  // Initialize Blockly workspace
  const initializeWorkspace = (element) => {
    if (!element) return;
    console.log("🔧 Initializing workspace...");
    try {
      const savedWorkspace = localStorage.getItem("blocklyWorkspace");

      // Inject a new workspace no matter what
      const workspace = Blockly.inject(element, {
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

      // If we have saved XML, load it
      if (savedWorkspace) {
        const xml = Blockly.utils.xml.textToDom(savedWorkspace);
        Blockly.Xml.domToWorkspace(xml, workspace);
        console.log("Loaded saved workspace");
      }

      workspace.addChangeListener((event) => {
        if (
          event.type == "create" ||
          event.type == "move" ||
          event.type == "change"
        ) {
          const xml = Blockly.Xml.workspaceToDom(workspace);
          const xmlText = Blockly.Xml.domToText(xml);
          localStorage.setItem("blocklyWorkspace", xmlText);
          generateCode();
        }
      });

      workspaceRef.current = workspace;
      setWorkspaceInitialized(true);
      console.log("Workspace initialization complete");
    } catch (error) {
      console.error("Error initializing workspace:", error);
    }
  };

  // Load saved workspace state and handle tab switching
  useEffect(() => {
    if (activeTab == "Blocks") {
      const savedState = localStorage.getItem("blocklyWorkspace");
      if (savedState) {
        try {
          const xml = Blockly.utils.xml.textToDom(savedState);
          Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspaceRef.current);
        } catch (error) {
          console.error("Error restoring workspace:", error);
        }
      }
    } else if (activeTab == "Code") {
      generateCode();
    }
  }, [activeTab]);

  // Manual save function for workspace
  const generateCode = () => {
    console.log("🔧 generateCode called");
    let mainCode;
    try {
      // Reset keyboard handlers before generation
      pythonGenerator.keyboardEventHandlers = {};
      const savedState = localStorage.getItem("blocklyWorkspace");
      if (savedState) {
        const xml = Blockly.utils.xml.textToDom(savedState);
        const tempWorkspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(xml, tempWorkspace);

        mainCode = pythonGenerator.workspaceToCode(tempWorkspace);
        console.log("Main code generated:", mainCode);

        // Dispose temporary workspace to avoid memory leaks
        tempWorkspace.dispose();
      }
      let finalCode = mainCode;
      const handlers = pythonGenerator.keyboardEventHandlers || {};
      const handlerList = Object.values(handlers);

      if (handlerList.length > 0) {
        finalCode = `${mainCode}\n#Event Handlers\n${handlerList.join("\n")}`;
        console.log("Final code with handlers:", finalCode);
      }

      // Update the shared state
      setGeneratedCode(finalCode);
      console.log("Code generated successfully, length:", finalCode.length);
      return finalCode;
    } catch (error) {
      console.error("Error generating code:", error);
      return "";
    }
  };

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      const sensor = detail.sensor;
      const value = detail.value;
  
      // Handle Micropython analog_sensors format
      if (sensor === "analog" && detail?.pin !== undefined) {
        const pin = detail.pin;
        setLatestAnalogByPin((prev) => ({ ...prev, [pin]: value }));
  
        setSensorHistory((prev) => {
          const newHistory = { ...prev };
          if (!newHistory[`pin_${pin}`]) {
            newHistory[`pin_${pin}`] = [];
          }
          const existing = newHistory[`pin_${pin}`];
          const next = [...existing, Number(value)].slice(-60);
          newHistory[`pin_${pin}`] = next;
          return newHistory;
        });
      }
  
    };
  
    window.addEventListener("sensorData", handler);
    return () => window.removeEventListener("sensorData", handler);
  }, []);
  
  // Handle BLE connection state
  useEffect(() => {
    const handleBleConnection = (event) => {
      setBleConnected(!!event?.detail?.connected);
    };

    window.addEventListener("bleConnection", handleBleConnection);
    return () =>
      window.removeEventListener("bleConnection", handleBleConnection);
  }, []);


  // Handle dashboard state
  useEffect(() => {
    try {
      const isActive = activeTab === "Dashboard";
      window.dispatchEvent(
        new CustomEvent("dashboardActive", { detail: { active: isActive } })
      );
    } catch (error) {
      console.error("Error dispatching dashboard state:", error);
    }
  }, [activeTab]);

  // Handle workspace clearing
  // useEffect(() => {
  //   const handleClearWorkspace = () => {
  //     console.log("🧹 handleClearWorkspace called - checking stack trace");
  //     console.trace("Workspace clear stack trace");
  //     if (workspaceRef.current) {
  //       // Only clear if explicitly requested (e.g., from Erase button)
  //       // Don't clear automatically after upload
  //       console.log(
  //         "Clearing workspace - this should only happen from Erase button"
  //       );
  //       workspaceRef.current.clear();
  //       setGeneratedCode("");
  //       localStorage.removeItem("blocklyWorkspace");
  //       console.log("Workspace manually cleared");
  //     } else {
  //       console.log("Cannot clear workspace - no workspace available");
  //     }
  //   };

  //   const handleGenerateCodeFromWorkspace = () => {
  //     console.log("📡 handleGenerateCodeFromWorkspace event received");
  //     console.log("workspaceRef.current exists:", !!workspaceRef.current);
  //     if (workspaceRef.current) {
  //       console.log("Calling generateCode from workspace event");
  //       const code = generateCode();
  //       console.log(
  //         "Code generated from workspace event, length:",
  //         code?.length
  //       );
  //       return code;
  //     } else {
  //       console.log("Cannot generate code: no workspace available");
  //       return "";
  //     }
  //   };

  //   window.addEventListener("clearBlocklyWorkspace", handleClearWorkspace);
  //   window.addEventListener(
  //     "generateCodeFromWorkspace",
  //     handleGenerateCodeFromWorkspace
  //   );
  //   return () => {
  //     window.removeEventListener("clearBlocklyWorkspace", handleClearWorkspace);
  //     window.removeEventListener(
  //       "generateCodeFromWorkspace",
  //       handleGenerateCodeFromWorkspace
  //     );
  //   };
  // }, [setGeneratedCode]);

  // Save workspace on page unload/refresh
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (workspaceRef.current && activeTab === "Blocks") {
        try {
          const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
          const xmlText = Blockly.Xml.domToText(xml);
          localStorage.setItem("blocklyWorkspace", xmlText);
          console.log("Workspace saved on page unload");
        } catch (error) {
          console.error("Error saving workspace on page unload:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeTab]);

 
  // Render chart for graph widgets
  const renderChart = (widget) => {
    const pin = widget.props.pin || 32;
    const widgetInfo = widgetData[widget.id];
    const series = widgetInfo?.history || [];
    const currentValue = widgetInfo?.value;

    const outerWidth = 420;
    const outerHeight = 240;
    const margin = { top: 12, right: 16, bottom: 32, left: 44 };
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;
    const points = series.length ? series : [0];

    // Fixed scale for analog values (0-4095)
    const yMin = 0;
    const yMax = 4095;
    const range = yMax - yMin || 1;
    const n = points.length;

    const toX = (i) => (n <= 1 ? 0 : (i / (n - 1)) * width);
    const toY = (v) => height - ((v - yMin) / range) * height;
    const path = points
      .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
      .join(" ");

    const yTicks = [yMin, yMin + range / 2, yMax];
    const xTickCount = Math.min(5, Math.max(n - 1, 1));
    const xTickIdx = Array.from({ length: xTickCount + 1 }, (_, i) =>
      Math.round((i * (n - 1)) / xTickCount)
    );

    useEffect(() => {
      console.log(widgetData);
    }, [widgetData]);
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 sm:col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-[#222E3A] opacity-80">
            Graph
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pin}
              onChange={(e) => {
                const nextPin = parseInt(e.target.value, 10);
                updateWidgetProps(widget.id, "pin", nextPin);
                setWidgetData((prev) => ({
                  ...prev,
                  [widget.id]: { ...prev[widget.id], history: [] },
                }));
              }}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[#222E3A] text-sm hover:bg-gray-50 focus:outline-none shadow-sm"
            >
              {ANALOG_PINS.map((pinNum) => (
                <option key={pinNum} value={pinNum}>
                  Pin {pinNum}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeWidget(widget.id)}
              aria-label="Remove widget"
              className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
            >
              ×
            </button>
          </div>
        </div>
        <svg width={outerWidth} height={outerHeight} className="w-full">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid lines and Y ticks */}
            {yTicks.map((t, i) => {
              const y = toY(t);
              return (
                <g key={`y-${i}`}>
                  <line
                    x1={0}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={-8}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#6B7280"
                  >
                    {Math.round(t)}
                  </text>
                </g>
              );
            })}
            {/* Axes */}
            <line x1={0} y1={height} x2={width} y2={height} stroke="#D1D5DB" />
            <line x1={0} y1={0} x2={0} y2={height} stroke="#D1D5DB" />
            {/* X ticks */}
            {xTickIdx.map((idx, i) => (
              <g key={`x-${i}`} transform={`translate(${toX(idx)},${height})`}>
                <line y2={4} stroke="#9CA3AF" />
                <text y={16} textAnchor="middle" fontSize="10" fill="#6B7280">
                  {idx}
                </text>
              </g>
            ))}
            {/* Data path */}
            <path d={path} fill="none" stroke="#2563EB" strokeWidth="2" />
            {/* Labels */}
            <text x={8} y={-4} fontSize="10" fill="#6B7280">
              {`Analog (0–4095) • PIN ${pin}`}
            </text>
            <text
              x={width / 2}
              y={height + 26}
              textAnchor="middle"
              fontSize="10"
              fill="#6B7280"
            >
              Samples
            </text>
          </g>
        </svg>
        <div className="mt-1 text-xs text-gray-500">
          {bleConnected
            ? `Latest: ${
                currentValue !== null ? Math.round(currentValue) : "—"
              }`
            : "—"}
        </div>
      </div>
    );
  };

  // Calculate dynamic margin based on sidebar state
  const sidebarWidth = sidebarCollapsed ? 80 : 260;
  const containerMarginLeft = sidebarWidth + 12; // Add some space from sidebar edge

  return (
    <div className="h-full bg-white flex flex-col">
      <div
        className="relative gap-3px my-2 rounded-3xl border border-blue-200 bg-white overflow-hidden flex h-full"
        style={{ 
          borderRadius: "48px",
          marginLeft: `${containerMarginLeft}px`,
          marginRight: "12px"
        }}
      >
        {/* Tab Navigation */}
        <div className="absolute top-0 right-4 m-2 flex items-center gap-0 z-20">
          <button
            onClick={() => setActiveTab("Blocks")}
            className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150 ${
              activeTab === "Blocks"
                ? "bg-white border border-blue-400 text-black shadow-sm"
                : "bg-blue-100 border border-transparent text-blue-800 hover:bg-blue-200"
            } rounded-l-[9999px] rounded-r-none`}
            style={{ minWidth: 120 }}
          >
            <Image src={blocksTabIcon} alt="Blocks" className="w-5 h-5" />
            <span className="ml-1 font-bold">Blocks</span>
          </button>

          <button
            onClick={() => setActiveTab("Code")}
            className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150 ${
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
            className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150 ${
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

        {/* Main Content Area */}
        <div className="z-5 flex-grow w-full">
          {/* Blocks Tab */}
          {activeTab === "Blocks" && (
            <div
              key={`blocks-workspace-${workspaceInitialized}`}
              ref={initializeWorkspace}
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "white",
              }}
            />
          )}

          {/* Code Tab */}
          {activeTab === "Code" && (
            <Editor
              height="90vh"
              defaultLanguage="python"
              value={generatedCode}
              theme="vs-light"
              options={{
                readOnly: true,
                padding: { top: 40, bottom: 20, left: 20, right: 20 },
                minimap: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          )}

          {/* Dashboard Tab */}
          {activeTab === "Dashboard" && (
            <div className="h-full w-full p-6 bg-[#F7FAFC] relative">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowAddMenu(true)}
                    className="px-3 py-1.5 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-sm font-medium text-[#222E3A]"
                  >
                    + Add widget
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {widgets.map((widget) => {
                    // Analog Widget
                    if (widget.type === "analog") {
                      const pin = widget.props.pin;
                      const widgetInfo = widgetData[widget.id];
                      const value =
                        widgetInfo?.value ?? latestAnalogByPin[pin] ?? 0;

                      return (
                        <div
                          key={widget.id}
                          className="bg-white border border-gray-100 rounded-2xl shadow-md p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-[#222E3A] opacity-80">
                              Analog
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={pin}
                                onChange={(e) =>
                                  updateWidgetProps(
                                    widget.id,
                                    "pin",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="text-xs text-black border border-gray-200 rounded px-2 py-1"
                              >
                                {ANALOG_PINS.map((pinNum) => (
                                  <option key={pinNum} value={pinNum}>
                                    Pin {pinNum}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeWidget(widget.id)}
                                aria-label="Remove widget"
                                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-[#222E3A]">
                            {bleConnected ? value : "—"}
                          </div>
                        </div>
                      );
                    }

                    // Digital Widget
                    if (widget.type === "digital") {
                      const pin = widget.props.pin ?? 32;
                      const widgetInfo = widgetData[widget.id];
                      let value = null;

                      if (widgetInfo && widgetInfo.isDigital) {
                        value = widgetInfo.value;
                      } else {
                        value = latestDigitalByPin[pin] ?? 0;
                      }

                      return (
                        <div
                          key={widget.id}
                          className="bg-white border border-gray-100 rounded-2xl shadow-md p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-[#222E3A] opacity-80">
                              Digital
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={pin}
                                onChange={(e) =>
                                  updateWidgetProps(
                                    widget.id,
                                    "pin",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="text-xs border border-gray-200 rounded px-2 py-1"
                              >
                                {DIGITAL_PINS.map((pinNum) => (
                                  <option key={pinNum} value={pinNum}>
                                    Pin {pinNum}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeWidget(widget.id)}
                                aria-label="Remove widget"
                                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              value ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {bleConnected ? (value ? "ON" : "OFF") : "—"}
                          </div>
                        </div>
                      );
                    }

                    // Graph Widget
                    if (widget.type === "graph") {
                      return renderChart(widget);
                    }

                    return null;
                  })}
                </div>

                {/* Add Widget Menu */}
                {showAddMenu && (
                  <div
                    className="absolute inset-0 z-30 flex items-center justify-center"
                    onClick={() => setShowAddMenu(false)}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div
                      className="relative w-[320px] rounded-xl shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-white px-4 py-3 border-b border-gray-200 text-[#222E3A] text-sm font-semibold">
                        Add a widget
                      </div>
                      <div className="bg-white p-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setWidgets((prev) => [
                                ...prev,
                                {
                                  id: `${Date.now()}-analog`,
                                  type: "analog",
                                  props: { pin: 36 },
                                },
                              ]);
                              setShowAddMenu(false);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                          >
                            Analog
                          </button>
                          <button
                            onClick={() => {
                              setWidgets((prev) => [
                                ...prev,
                                {
                                  id: `${Date.now()}-digital`,
                                  type: "digital",
                                  props: { pin: 5 },
                                },
                              ]);
                              setShowAddMenu(false);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                          >
                            Digital
                          </button>
                          <button
                            onClick={() => {
                              setWidgets((prev) => [
                                ...prev,
                                {
                                  id: `${Date.now()}-graph`,
                                  type: "graph",
                                  props: { sensor: "ldr", pin: 32 },
                                },
                              ]);
                              setShowAddMenu(false);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                          >
                            Graph
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
