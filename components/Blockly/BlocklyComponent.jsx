"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
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
import { useUser } from "@/context/UserContext";

Blockly.setLocale(En);

const BlocklyComponent = (
  { generatedCode, setGeneratedCode, onWorkspaceChange },
  ref
) => {
  // Sidebar context
  const { sidebarCollapsed } = useSidebar();
  // User context for personalization
  const { userData } = useUser();

  // State management
  const [activeTab, setActiveTab] = useState("Blocks");
  const [expandMenu, setExpandMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bleConnected, setBleConnected] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [latestAnalogByPin, setLatestAnalogByPin] = useState({});
  const [latestDigitalByPin, setLatestDigitalByPin] = useState({});
  const [widgetData, setWidgetData] = useState({});
  const [sensorHistory, setSensorHistory] = useState({});
  const [isPaletteLocked, setIsPaletteLocked] = useState(false);
  const [isFlyoutPinned, setIsFlyoutPinned] = useState(false);

  // Python code editing state
  const [editableCode, setEditableCode] = useState("");
  const [codeHasBeenEdited, setCodeHasBeenEdited] = useState(false);
  const [showCodeResetWarning, setShowCodeResetWarning] = useState(false);

  const workspaceRef = useRef(null);
  const isLoadingWorkspace = useRef(false);

  // Pin toggle function
  const togglePin = useCallback(() => {
    console.log("togglePin called, current state:", isFlyoutPinned);
    const newState = !isFlyoutPinned;
    console.log("Setting pin state to:", newState);
    setIsFlyoutPinned(newState);
    // Store pin state globally so flyout overrides can access it
    window.blocklyFlyoutPinned = newState;
  }, [isFlyoutPinned]);

  // Initialize global pin state
  useEffect(() => {
    window.blocklyFlyoutPinned = isFlyoutPinned;
  }, [isFlyoutPinned]);

  // Constants
  const ANALOG_PINS = [
    0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33,
    34, 35, 36, 39,
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
          contents: [
            { kind: "block", type: "keyboard_when_key_pressed" },
            { kind: "block", type: "keyboard_when_custom_key_pressed" },
          ],
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
  }, [sidebarCollapsed]);

  // Handle category selection and UI interactions
  useEffect(() => {
    if (activeTab !== "Blocks") return;

    const handleMainBackgroundClick = () => {
      if (!isFlyoutPinned) {
        setExpandMenu(false);
        setSelectedCategory("");
      }
    };

    // Handle workspace interactions
    const handleWorkspaceInteraction = () => {
      // Keep flyout open during workspace interactions
      setExpandMenu(true);
    };

    // Handle drag operations to keep flyout open
    const handleDragStart = () => {
      console.log("Drag started - maintaining flyout state");
      if (expandMenu && selectedCategory) {
        setExpandMenu(true);
      }
    };

    const handleDragEnd = () => {
      console.log("Drag ended");
      // Only close flyout if not pinned
      if (!isFlyoutPinned) {
        // Small delay to prevent immediate closing
        setTimeout(() => {
          if (!isFlyoutPinned) {
            setExpandMenu(false);
            setSelectedCategory("");
          }
        }, 100);
      }
    };

    const blocklyBgDiv = document.querySelector(".blocklyMainBackground");
    if (blocklyBgDiv) {
      blocklyBgDiv.addEventListener("click", handleMainBackgroundClick);
      // Add listeners for various workspace interactions
      blocklyBgDiv.addEventListener("mousedown", handleWorkspaceInteraction);
      blocklyBgDiv.addEventListener("mouseup", handleWorkspaceInteraction);
      blocklyBgDiv.addEventListener("dragstart", handleWorkspaceInteraction);
      blocklyBgDiv.addEventListener("dragend", handleWorkspaceInteraction);
    }

    // Also listen for block interactions
    const blocklyWorkspace = document.querySelector(".blocklyMainWorkspace");
    if (blocklyWorkspace) {
      blocklyWorkspace.addEventListener(
        "mousedown",
        handleWorkspaceInteraction
      );
      blocklyWorkspace.addEventListener("mouseup", handleWorkspaceInteraction);
      blocklyWorkspace.addEventListener("dragstart", handleDragStart);
      blocklyWorkspace.addEventListener("dragend", handleDragEnd);
    }

    // Listen for drag events on the flyout as well
    const flyout = document.querySelector(".blocklyFlyout");
    if (flyout) {
      flyout.addEventListener("dragstart", handleDragStart);
      flyout.addEventListener("dragend", handleDragEnd);
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
          if (!isFlyoutPinned) {
            setSelectedCategory("");
            setExpandMenu(false);
            console.log("Closing flyout");
          } else {
            console.log("Flyout is pinned, keeping it open");
          }
        } else {
          setSelectedCategory(clickedCategoryId);
          setExpandMenu(true);
          // Unpin when switching to a different category
          setIsFlyoutPinned(false);
          console.log("Opening flyout for:", clickedCategoryId);
        }
      };

      row.addEventListener("click", handleClick);
      clickHandlers.push({ element: row, handler: handleClick });
    });

    // Add selected class to category icon - try multiple selectors
    if (selectedCategory) {
      console.log("Selected category:", selectedCategory);

      // Add a small delay to ensure DOM is updated
      setTimeout(() => {
        // Try different selectors to find the icon
        const selectors = [
          `#${selectedCategory} .categoryBubble`,
          `#${selectedCategory}.blocklyTreeSelected .categoryBubble`,
          `#${selectedCategory}.blocklyTreeRow .categoryBubble`,
          `#${selectedCategory} .blocklyToolboxCategoryIcon`,
          `#${selectedCategory} .blocklyTreeRow .blocklyToolboxCategoryIcon`,
          `#${selectedCategory} .blocklyToolboxCategory .blocklyToolboxCategoryIcon`,
          `#${selectedCategory} svg`,
          `#${selectedCategory} .blocklyIcon`,
          `#${selectedCategory} [class*="Icon"]`,
          `#${selectedCategory} [class*="icon"]`,
        ];

        // First try to find the selected row
        const selectedRow = document.querySelector(`#${selectedCategory}`);
        if (selectedRow) {
          console.log("Found selected row:", selectedRow);

          // Look for categoryBubble within the row
          const categoryIcon = selectedRow.querySelector(".categoryBubble");
          if (categoryIcon) {
            console.log("Found categoryBubble:", categoryIcon);
            console.log("Current style:", categoryIcon.getAttribute("style"));
            console.log(
              "Computed style:",
              window.getComputedStyle(categoryIcon).backgroundColor
            );

            // Remove any forced styling - let CSS handle the visual indicators
            console.log(
              "Selected category found - CSS will handle visual indicators"
            );

            console.log("Applied dark color to categoryBubble");
            console.log("New style:", categoryIcon.getAttribute("style"));
            console.log(
              "New computed style:",
              window.getComputedStyle(categoryIcon).backgroundColor
            );

            // No need for forced styling - CSS handles visual indicators

            // No need to apply black styling to children - CSS handles visual indicators
          } else {
            console.log("Could not find categoryBubble in selected row");
            console.log("Row children:", selectedRow.children);

            // Try to find any element with background-color style
            const allElements = selectedRow.querySelectorAll("*");
            allElements.forEach((el, index) => {
              const style = el.getAttribute("style");
              if (style && style.includes("background-color")) {
                console.log(
                  `Element ${index} with background-color:`,
                  el,
                  style
                );
              }
            });
          }
        } else {
          console.log("Could not find selected row with ID:", selectedCategory);
        }
      }, 100);
    }

    return () => {
      if (blocklyBgDiv) {
        blocklyBgDiv.removeEventListener("click", handleMainBackgroundClick);
        blocklyBgDiv.removeEventListener(
          "mousedown",
          handleWorkspaceInteraction
        );
        blocklyBgDiv.removeEventListener("mouseup", handleWorkspaceInteraction);
        blocklyBgDiv.removeEventListener(
          "dragstart",
          handleWorkspaceInteraction
        );
        blocklyBgDiv.removeEventListener("dragend", handleWorkspaceInteraction);
      }

      const blocklyWorkspace = document.querySelector(".blocklyMainWorkspace");
      if (blocklyWorkspace) {
        blocklyWorkspace.removeEventListener(
          "mousedown",
          handleWorkspaceInteraction
        );
        blocklyWorkspace.removeEventListener(
          "mouseup",
          handleWorkspaceInteraction
        );
        blocklyWorkspace.removeEventListener("dragstart", handleDragStart);
        blocklyWorkspace.removeEventListener("dragend", handleDragEnd);
      }

      const flyout = document.querySelector(".blocklyFlyout");
      if (flyout) {
        flyout.removeEventListener("dragstart", handleDragStart);
        flyout.removeEventListener("dragend", handleDragEnd);
      }

      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
    };
  }, [activeTab, selectedCategory, isFlyoutPinned]);

  // Handle keyboard shortcuts for pin functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        event.stopPropagation();
        if (activeTab === "Blocks" && expandMenu && selectedCategory) {
          togglePin();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, expandMenu, selectedCategory, togglePin]);

  // Apply dynamic styles for Blocks tab
  useEffect(() => {
    if (activeTab !== "Blocks") return;

    // Calculate sidebar width and toolbox position
    const sidebarWidth = 120;
    const toolboxLeftMargin = sidebarWidth - 100;

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
        ${
          isPaletteLocked
            ? "pointer-events: none !important; opacity: 0.5 !important;"
            : ""
        }
      }
    
    .blocklyToolboxCategory {
      transition: all 0.2s ease-in-out;
    }
    
    .blocklyToolboxCategory:hover {
      background-color: rgba(113, 114, 115, 0.8);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      transform: scale(1.02);
    }
    

    .blocklyToolboxCategoryIcon {
      width: 40px !important;
      height: 100px !important;
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

    .blocklyTreeRow.selected-category .blocklyToolboxCategoryLabel {
      color: #ffffff !important;
    }

   
    .blocklyToolboxCategory {
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
      padding: 0.05rem 0 !important;
      transition: all 0.2s ease-in-out;
    }

   
     .blocklyTreeRow.blocklyTreeSelected .blocklyTreeLabel {
      line-height: 1.2 !important;
      max-height: 100% !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    
  
         /* Circular button effect for selected category */
     .blocklyTreeRow.blocklyTreeSelected .categoryBubble {
       border: 1px solid #ffffff !important;
       box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3) !important;
       transform: scale(1.1) !important;
       transition: all 0.3s ease !important;
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
      top: calc(4vh + 32px) !important;
      overflow: hidden !important;
      width: 280px !important;
      transition: all 0.3s ease-in-out;
      position: relative !important;
      border-radius: 0 0 12px 12px !important;
    }

    .blocklyFlyout .blocklyBlockCanvas {
      transform: scale(0.7) !important;
      transform-origin: 0 0 !important;
    }

         .blocklyFlyoutBackground {
       fill: ${isFlyoutPinned ? "#f8fafc" : "#ffffff"} !important;
       fill-opacity: 1 !important;
       transition: all 0.3s ease-in-out;
       ${
         isFlyoutPinned
           ? "stroke: #3b82f6 !important; stroke-width: 3 !important; stroke-dasharray: 5,5 !important;"
           : "stroke: #e5e7eb !important; stroke-width: 1 !important;"
       }
     }

     /* Hide scrollbars in Blockly workspace */
     .blocklyMainWorkspace {
       overflow: hidden !important;
     }
     
     .blocklyMainWorkspace > svg {
       overflow: hidden !important;
     }
     
     .blocklyWorkspace {
       overflow: hidden !important;
     }
     
     .blocklyWorkspace > svg {
       overflow: hidden !important;
     }
     
     /* Hide scrollbars in flyout */
     .blocklyFlyout {
       overflow: hidden !important;
     }
     
     .blocklyFlyout > svg {
       overflow: hidden !important;
     }
     
     /* Hide all scrollbars globally */
     .blocklyScrollbarHorizontal,
     .blocklyScrollbarVertical,
     .blocklyScrollbarHandle,
     .blocklyScrollbarBackground {
       display: none !important;
       visibility: hidden !important;
     }
     
     /* Hide scrollbars on all Blockly elements */
     .blocklyMainWorkspace *,
     .blocklyWorkspace *,
     .blocklyFlyout * {
       scrollbar-width: none !important;
       -ms-overflow-style: none !important;
     }
     
     .blocklyMainWorkspace *::-webkit-scrollbar,
     .blocklyWorkspace *::-webkit-scrollbar,
     .blocklyFlyout *::-webkit-scrollbar {
       display: none !important;
       width: 0 !important;
       height: 0 !important;
     }

    .blocklyFlyoutScrollbar {
      display: none !important;
      visibility: hidden !important;
      margin-left: 35px !important;
      top: calc(4vh + 32px) !important;
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

 
    .blocklyToolboxCategory:hover .blocklyTreeLabel {
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      font-weight: 600;
    }
    
 
    


    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById("blockly-dynamic-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [activeTab, sidebarCollapsed, isFlyoutPinned]);

  // Initialize Blockly workspace
  const initializeWorkspace = (element) => {
    if (!element) return;
    // Prevent re-initializing if a workspace already exists
    if (workspaceRef.current) return;
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
        // Ignore events fired while programmatically loading/restoring workspace
        if (isLoadingWorkspace.current) return;
        if (
          event.type == "create" ||
          event.type == "move" ||
          event.type == "change"
        ) {
          const xml = Blockly.Xml.workspaceToDom(workspace);
          const xmlText = Blockly.Xml.domToText(xml);
          localStorage.setItem("blocklyWorkspace", xmlText);
          generateCode();

          // Notify parent component about workspace changes
          if (onWorkspaceChange) {
            console.log("Workspace change detected, calling onWorkspaceChange");
            onWorkspaceChange();
          } else {
            console.log("onWorkspaceChange not provided");
          }
        }
      });

      // Override flyout behavior to prevent closing during drag operations or when pinned
      const originalFlyout = workspace.getFlyout();
      if (originalFlyout) {
        const originalHide = originalFlyout.hide;
        originalFlyout.hide = function () {
          // Don't hide flyout if we're in the middle of a drag operation or if pinned
          if (workspace.isDragging()) {
            console.log("Preventing flyout hide - dragging in progress");
            return;
          }
          // Check current pin state from global variable
          if (window.blocklyFlyoutPinned) {
            console.log("Preventing flyout hide - flyout is pinned");
            return;
          }
          originalHide.call(this);
        };
      }

      // Track drag operations to maintain flyout state
      workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_DRAG) {
          if (event.isStart) {
            console.log("Block drag started - keeping flyout open");
            // Ensure flyout stays open during drag
            if (expandMenu && selectedCategory) {
              setExpandMenu(true);
            }
          }
        }
      });

      workspaceRef.current = workspace;

      // Set up flyout behavior override after workspace is ready
      setTimeout(() => {
        const toolbox = workspace.getToolbox();
        if (toolbox && toolbox.flyout_) {
          const flyout = toolbox.flyout_;
          const originalHide = flyout.hide;
          const originalShow = flyout.show;

          flyout.hide = function () {
            // Don't hide if we're dragging or if flyout is pinned
            if (workspace.isDragging()) {
              console.log("Preventing flyout hide during drag");
              return;
            }
            // Check current pin state from global variable
            if (window.blocklyFlyoutPinned) {
              console.log("Preventing flyout hide - flyout is pinned");
              return;
            }
            originalHide.call(this);
          };

          flyout.show = function (categoryId) {
            originalShow.call(this, categoryId);
            // Ensure flyout stays visible during drag operations
            if (workspace.isDragging()) {
              console.log("Ensuring flyout stays visible during drag");
            }
          };
        }
      }, 100);

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
          if (workspaceRef.current) {
            isLoadingWorkspace.current = true;
            Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspaceRef.current);
            isLoadingWorkspace.current = false;
            // Generate code once after restore without reacting to intermediate events
            generateCode();
          }
        } catch (error) {
          console.error("Error restoring workspace:", error);
          isLoadingWorkspace.current = false;
        }
      }
    } else if (activeTab == "Code") {
      // Dispose workspace when leaving Blocks so it can re-init on return
      if (
        workspaceRef.current &&
        typeof workspaceRef.current.dispose === "function"
      ) {
        try {
          workspaceRef.current.dispose();
        } catch {}
        workspaceRef.current = null;
      }
      generateCode();
      // Initialize editable code when switching to Code tab
      if (editableCode !== generatedCode) {
        setEditableCode(generatedCode);
      }
      setCodeHasBeenEdited(false);
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

      // Update the shared state only if changed to avoid redundant renders
      if (typeof finalCode === "string" && finalCode !== generatedCode) {
        setGeneratedCode(finalCode);
        console.log("Code generated successfully, length:", finalCode.length);
      }
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

        // Update widgetData for graph and gauge widgets that use this pin
        setWidgetData((prev) => {
          const newWidgetData = { ...prev };

          // Find all graph and gauge widgets that use this pin
          widgets.forEach((widget) => {
            if (
              (widget.type === "graph" || widget.type === "gauge") &&
              widget.props.pin === pin
            ) {
              if (!newWidgetData[widget.id]) {
                newWidgetData[widget.id] = {};
              }
              newWidgetData[widget.id] = {
                ...newWidgetData[widget.id],
                value: Number(value),
                history: newWidgetData[widget.id].history || [],
              };

              // Update history for graph widgets (gauge widgets don't need history)
              if (widget.type === "graph") {
                const existingHistory = newWidgetData[widget.id].history;
                const updatedHistory = [
                  ...existingHistory,
                  Number(value),
                ].slice(-60);
                newWidgetData[widget.id].history = updatedHistory;
              }
            }
          });

          return newWidgetData;
        });
      }
    };

    window.addEventListener("sensorData", handler);
    return () => {
      window.removeEventListener("sensorData", handler);
      // window.removeEventListener("blocklyWorkspaceChange", blocklyWorkspaceChange);
    };
  }, [widgets]);

  // Handle BLE connection state
  useEffect(() => {
    const handleBleConnection = (event) => {
      setBleConnected(!!event?.detail?.connected);
    };

    window.addEventListener("bleConnection", handleBleConnection);
    return () =>
      window.removeEventListener("bleConnection", handleBleConnection);
  }, []);

  // Handle tab switching with code editing warning
  const handleTabSwitch = (newTab) => {
    if (activeTab === "Code" && newTab === "Blocks" && codeHasBeenEdited) {
      setShowCodeResetWarning(true);
    } else {
      setActiveTab(newTab);
      if (newTab === "Code") {
        setEditableCode(generatedCode);
        setCodeHasBeenEdited(false);
      }
      // Only unpin flyout when switching away from Blocks tab
      if (newTab !== "Blocks") {
        setIsFlyoutPinned(false);
      }
    }
  };

  // Handle code reset confirmation
  const handleCodeResetConfirm = () => {
    setShowCodeResetWarning(false);
    setCodeHasBeenEdited(false);
    setActiveTab("Blocks");
    // Reset the editable code to match the generated code
    setEditableCode(generatedCode);
  };

  // Handle code reset cancellation
  const handleCodeResetCancel = () => {
    setShowCodeResetWarning(false);
  };

  // Function to get the current code (either edited or generated)
  const getCurrentCode = () => {
    if (activeTab === "Code" && codeHasBeenEdited) {
      return editableCode;
    }
    return generatedCode;
  };

  // Expose imperative API to parent
  useImperativeHandle(ref, () => ({
    getCurrentCode,
    workspaceRef,
  }));

  // // Initialize editable code when component loads
  // useEffect(() => {
  //   setEditableCode(generatedCode);
  // }, [generatedCode]);

  // Handle dashboard state
  // useEffect(() => {
  //   try {
  //     const isActive = activeTab === "Dashboard";
  //     window.dispatchEvent(
  //       new CustomEvent("dashboardActive", { detail: { active: isActive } })
  //     );
  //   } catch (error) {
  //     console.error("Error dispatching dashboard state:", error);
  //   }
  // }, [activeTab]);

  // Handle workspace clearing

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
    const currentValue = widgetInfo?.value ?? latestAnalogByPin[pin];

    const outerWidth = 420;
    const outerHeight = 240;
    const margin = { top: 12, right: 16, bottom: 32, left: 44 };
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;
    const points = series.length
      ? series
      : latestAnalogByPin[pin]
      ? [latestAnalogByPin[pin]]
      : [0];

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
  const sidebarWidth = sidebarCollapsed
    ? 65
    : window.location.href.includes("missions")
    ? 65
    : 235;
  const instructionColumnWidth = window.location.href.includes("missions")
    ? -50
    : window.location.href.includes("playground")
    ? 30
    : -50; // Mission page needs smaller gap (-50), playground keeps current gap (30)
  const consistentGap = 1; // Reduced gap between instruction and Blockly
  const containerMarginLeft =
    sidebarWidth + instructionColumnWidth + consistentGap;

  return (
    <div className="h-full bg-white flex flex-col">
      <div
        className="relative gap-3px my-2 rounded-3xl border border-blue-200 bg-white overflow-hidden flex h-full"
        style={{
          borderRadius: "48px",
          marginLeft: `${containerMarginLeft}px`,
          marginRight: "12px",
        }}
      >
        {/* Tab Navigation */}
        <div className="absolute top-0 right-4 m-2 flex items-center gap-0 z-20">
          {/* Palette Lock Button */}
          <button
            onClick={() => setIsPaletteLocked(!isPaletteLocked)}
            className={`flex items-center gap-2 px-3 py-2 font-semibold text-sm border transition-colors duration-150 ${
              isPaletteLocked
                ? "bg-red-100 border-red-400 text-red-800"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            } rounded-full mr-2`}
            title={isPaletteLocked ? "Unlock Palette" : "Lock Palette"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isPaletteLocked ? (
                <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />
              ) : (
                <path d="M13.73 21a2 2 0 0 1-3.46 0M21 2v6h-6M3 10a7 7 0 0 1 10.5-6M3 10a7 7 0 0 0 6 6M3 10a7 7 0 0 1 7-7" />
              )}
            </svg>
            <span className="text-xs">
              {isPaletteLocked ? "Locked" : "Lock"}
            </span>
          </button>

          <button
            onClick={() => handleTabSwitch("Blocks")}
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
            onClick={() => handleTabSwitch("Code")}
            className={`flex items-center gap-2 px-5 py-2 font-semibold text-sm border transition-colors duration-150 ${
              activeTab === "Code"
                ? "bg-white border-blue-400 text-blue-900 shadow-sm"
                : "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
            } rounded-none relative`}
            style={{ minWidth: 120 }}
          >
            <Image src={codingIcon} alt="Code" className="w-5 h-5" />
            <span className="ml-1 font-bold">Code</span>
            {codeHasBeenEdited && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </button>

          <button
            onClick={() => handleTabSwitch("Dashboard")}
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
            <>
              {/* Pin button inside flyout */}
              {expandMenu && selectedCategory && (
                <div
                  className="absolute z-50"
                  style={{
                    left: "115px",
                    top: "5.5vh",
                    pointerEvents: "auto",
                  }}
                >
                  <button
                    data-flyout-pinned={isFlyoutPinned}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePin();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`p-1.5 rounded-md transition-all duration-200 shadow-sm ${
                      isFlyoutPinned
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-300"
                    }`}
                    title={
                      isFlyoutPinned
                        ? "Unpin flyout (Ctrl+P)"
                        : "Pin flyout (Ctrl+P)"
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={isFlyoutPinned ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 12V4a4 4 0 0 0-8 0v8m-4-8h16" />
                      <circle cx="12" cy="16" r="2" />
                    </svg>
                  </button>
                </div>
              )}

              <div
                ref={initializeWorkspace}
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "white",
                }}
              />
            </>
          )}

          {/* Code Tab */}
          {activeTab === "Code" && (
            <Editor
              height="90vh"
              defaultLanguage="python"
              value={editableCode}
              onChange={(value) => {
                setEditableCode(value);
                if (value !== generatedCode) {
                  setCodeHasBeenEdited(true);
                } else {
                  setCodeHasBeenEdited(false);
                }
              }}
              theme="vs-light"
              options={{
                readOnly: false,
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

                    // Gauge Widget
                    if (widget.type === "gauge") {
                      const pin = widget.props.pin ?? 32;
                      const widgetInfo = widgetData[widget.id];
                      const value =
                        widgetInfo?.value ?? latestAnalogByPin[pin] ?? 0;

                      // Calculate gauge properties
                      const minValue = 0;
                      const maxValue = 4095;
                      const percentage = Math.min(
                        100,
                        Math.max(
                          0,
                          ((value - minValue) / (maxValue - minValue)) * 100
                        )
                      );
                      const angle = (percentage / 100) * 180 - 90;
                      // Calculate the end point for the fill path
                      const radius = 50;
                      const centerX = 60;
                      const centerY = 70;
                      const startAngle = -180; // Start from left side
                      const endAngle = startAngle + (percentage / 100) * 180;

                      // Convert angles to radians and calculate end point
                      const endAngleRad = (endAngle * Math.PI) / 180;
                      const endX = centerX + radius * Math.cos(endAngleRad);
                      const endY = centerY + radius * Math.sin(endAngleRad);

                      // Color based on value
                      const getGaugeColor = (val) => {
                        const pct = (val / maxValue) * 100;
                        if (pct < 33) return "#10B981"; // Green
                        if (pct < 66) return "#F59E0B"; // Yellow
                        return "#EF4444"; // Red
                      };

                      return (
                        <div
                          key={widget.id}
                          className="bg-white border border-gray-100 rounded-2xl shadow-md p-5"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-[#222E3A] opacity-80">
                              Gauge Meter
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

                          {/* Gauge SVG */}
                          <div className="flex justify-center mb-3">
                            <svg width="120" height="80" viewBox="0 0 120 80">
                              {/* Gauge background */}
                              <path
                                d="M 10 70 A 50 50 0 0 1 110 70"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="8"
                                strokeLinecap="round"
                              />

                              {/* Gauge fill */}
                              <path
                                d={`M 10 70 A 50 50 0 0 1 ${endX} ${endY}`}
                                fill="none"
                                stroke={getGaugeColor(value)}
                                strokeWidth="8"
                                strokeLinecap="round"
                                // className="transition-all duration-500 ease-out"
                              />

                              {/* Center point */}
                              <circle cx="60" cy="70" r="3" fill="#6B7280" />

                              {/* Needle */}
                              <line
                                x1="60"
                                y1="70"
                                x2={centerX + Math.cos(endAngleRad) * 35}
                                y2={centerY + Math.sin(endAngleRad) * 35}
                                stroke="#374151"
                                strokeWidth="2"
                                strokeLinecap="round"
                                // className="transition-all duration-1 ease-out"
                              />

                              {/* Value text */}
                              <text
                                x="60"
                                y="45"
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="600"
                                fill="#111827"
                              >
                                {bleConnected ? Math.round(value) : "—"}
                              </text>

                              {/* Pin label */}
                              <text
                                x="60"
                                y="60"
                                textAnchor="middle"
                                fontSize="10"
                                fill="#6B7280"
                              >
                                PIN {pin}
                              </text>
                            </svg>
                          </div>

                          {/* Scale markers */}
                          <div className="flex justify-between text-xs text-gray-500 px-2">
                            <span>0</span>
                            <span>2048</span>
                            <span>4095</span>
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
                              const newWidgetId = `${Date.now()}-gauge`;
                              setWidgets((prev) => [
                                ...prev,
                                {
                                  id: newWidgetId,
                                  type: "gauge",
                                  props: { pin: 32 },
                                },
                              ]);

                              // Initialize widget data with current sensor value if available
                              const currentPinValue = latestAnalogByPin[32];
                              if (currentPinValue !== undefined) {
                                setWidgetData((prev) => ({
                                  ...prev,
                                  [newWidgetId]: {
                                    value: currentPinValue,
                                    history: [currentPinValue],
                                  },
                                }));
                              }

                              setShowAddMenu(false);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-left hover:bg-gray-50 text-[#222E3A]"
                          >
                            Gauge Meter
                          </button>
                          <button
                            onClick={() => {
                              const newWidgetId = `${Date.now()}-graph`;
                              setWidgets((prev) => [
                                ...prev,
                                {
                                  id: newWidgetId,
                                  type: "graph",
                                  props: { sensor: "ldr", pin: 32 },
                                },
                              ]);

                              // Initialize widget data with current sensor value if available
                              const currentPinValue = latestAnalogByPin[32];
                              if (currentPinValue !== undefined) {
                                setWidgetData((prev) => ({
                                  ...prev,
                                  [newWidgetId]: {
                                    value: currentPinValue,
                                    history: [currentPinValue],
                                  },
                                }));
                              }

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

                {/* AI Chatbot - Always visible */}
                <div className="absolute bottom-4 right-4 z-30">
                  <AIChatbot
                    position="right"
                    workspaceRef={workspaceRef}
                    onClose={() => {}}
                    username={userData?.name || "there"}
                  />
                </div>

                {/* Palette Lock Overlay */}
                {isPaletteLocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 z-40 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-4 shadow-lg border border-gray-200 pointer-events-auto">
                      <div className="flex items-center gap-3">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Palette Locked
                          </p>
                          <p className="text-sm text-gray-600">
                            Click the lock button to unlock
                          </p>
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

      {/* Code Reset Warning Modal */}
      {showCodeResetWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-90 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Code Will Be Reset
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                You've made changes to the Python code. Switching back to Blocks
                will reset your manual edits and regenerate the code from the
                blocks.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCodeResetCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Stay on Code
              </button>
              <button
                onClick={handleCodeResetConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default forwardRef(BlocklyComponent);
