import React, { useState, useRef, useEffect } from 'react';
import { FaChevronRight, FaRegPaperPlane } from "react-icons/fa";
import * as Blockly from "blockly";
import chatbotImg from '@/assets/chatbot.png';
import ChatBubbleSVG from "@/assets/chat-bubble.svg";
import Image from 'next/image';

export default function AIChatbot({ position = "right", workspaceRef, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI assistant. How can I help you with Magicbit blocks today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [collapseLevel, setCollapseLevel] = useState(2); // Start in mini pill mode to show bubble
  


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);





  // Toggle between collapse states
  const toggleCollapseLevel = () => {
    setCollapseLevel(prev => (prev + 1) % 3);
  };

  // Get chatbot container classes based on collapse level
  const getChatbotClasses = () => {
    const baseClasses = "chatbot-container-modern";
    switch (collapseLevel) {
      case 0: return `${baseClasses} expanded`;
      case 1: return `${baseClasses} header-only`;
      case 2: return `${baseClasses} mini-pill`;
      default: return baseClasses;
    }
  };

  const blockList = `
Available Magicbit blocks with parameters:

**Digital Control:**
- magicbit_set_digital(PIN: number, STATE: "HIGH"|"LOW") - sets digital pin high/low
- magicbit_clear_display() - clears the OLED display

**Display:**
- magicbit_display_text(TEXT: string, X: number, Y: number) - writes text on OLED at x,y coordinates

**Analog Control:**
- magicbit_set_pwm(PIN: number, VALUE: number 0-255) - sets PWM duty cycle on pin
- magicbit_set_servo(PIN: number, ANGLE: number 0-180) - sets servo angle in degrees
- magicbit_read_analog(PIN: number) - reads analog value from pin

**Sensors:**
- magicbit_touch(PIN: number) - reads touch sensor on pin
- magicbit_read_button(BUTTON: "LEFT"|"RIGHT") - reads left/right button state
- magicbit_ultrasonic(PIN: number) - reads distance from ultrasonic sensor
- magicbit_read_humidity(PIN: number) - reads humidity sensor value

**Output:**
- magicbit_neopixel_rgb(PIN: number, R: number 0-255, G: number 0-255, B: number 0-255) - sets NeoPixel color
- magicbit_play_tone(PIN: number, FREQUENCY: number, DURATION: number) - plays tone on pin

**Motion:**
- magicbit_motor(SIDE: "LEFT"|"RIGHT", DIR: "FWD"|"BWD", SPEED: number 0-100) - controls left/right motor forward/backward with speed percentage

**Control:**
- delay_block(DELAY: number) - adds delay in seconds

**Keyboard Events:**
- keyboard_when_key_pressed(KEY: "up"|"down"|"left"|"right") - handles arrow key press events
- keyboard_when_custom_key_pressed(CUSTOM_KEY: string) - handles custom key press events (e.g., "a", "space", "1")

**Important Notes:**
- Only use the Magicbit blocks listed above - do NOT use standard Blockly control blocks
- **ALWAYS use keyboard blocks for user input events:**
  - Use \`keyboard_when_key_pressed\` for arrow keys (up, down, left, right)
  - Use \`keyboard_when_custom_key_pressed\` for other keys (a, space, 1, etc.)
- For button/keyboard events: blocks can be added independently without loops since they work as event handlers
- Keep programs simple and focused on the available Magicbit blocks

**Parameter Notes:**
- PIN: Use valid GPIO pin numbers (e.g., 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39)
- ANGLE: Servo angles typically 0-180 degrees
- PWM: Values 0-255 (0=off, 255=full on)
- RGB: Each color component 0-255 (0=off, 255=full brightness)
- FREQUENCY: Sound frequency in Hz (e.g., 440 for A4 note)
- DURATION: Time in milliseconds
`;

// Get current workspace XML
const getCurrentWorkspaceXML = () => {
  const workspace = (workspaceRef && workspaceRef.current) ? workspaceRef.current : Blockly.getMainWorkspace();
  if (!workspace) {
    console.error("No Blockly workspace found");
    return null;
  }
  try {
    return Blockly.Xml.workspaceToDom(workspace);
  } catch (err) {
    console.error("Error getting workspace XML:", err);
    return null;
  }
};

// Replace entire workspace with new XML
const replaceWorkspaceWithXML = (xmlString) => {
  const workspace = (workspaceRef && workspaceRef.current) ? workspaceRef.current : Blockly.getMainWorkspace();
  if (!workspace) {
    console.error("No Blockly workspace found");
    return false;
  }
  try {
    // Clear current workspace
    workspace.clear();
    
    // Parse and add new XML
    const xmlDom = Blockly.utils.xml.textToDom(xmlString);
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
    
    // Render the workspace
    workspace.render();
    return true;
  } catch (err) {
    console.error("Error replacing workspace:", err);
    return false;
  }
};

const addBlockToWorkspace = (type, fields = {}, offset = [20, 20]) => {
  // Defensive: use workspaceRef if available, else fallback to Blockly.getMainWorkspace()
  const workspace = (workspaceRef && workspaceRef.current) ? workspaceRef.current : Blockly.getMainWorkspace();
  if (!workspace) {
    console.error("No Blockly workspace found");
    return false;
  }
  try {
    const block = workspace.newBlock(type);
    if (!block) {
      console.error(`Failed to create block of type: ${type}`);
      return false;
    }
    Object.entries(fields).forEach(([key, value]) => {
      block.setFieldValue(value, key);
    });
    block.initSvg();
    block.moveBy(...offset);
    block.render();
    workspace.render();
    return true;
  } catch (err) {
    console.error("Error adding block to workspace:", err);
    return false;
  }
};

const handleCommand = (text) => {
  const lower = text.toLowerCase().trim();
// clear display
  if (lower === "clear display") {
    if (addBlockToWorkspace("magicbit_clear_display")) {
      return "✅ Added *clear display* block.";
    }
    return "⚠️ Failed to add clear display block.";
  }
//digital pin
   const digitalMatch = lower.match(/(?:set|add)\s+digital\s+pin\s+(?:to\s+)?(\d+)\s+(high|low)/i);
   if (digitalMatch) {
   const pin = digitalMatch[1];
   const state = digitalMatch[2].toUpperCase();
   if (addBlockToWorkspace("magicbit_set_digital", { PIN: pin, STATE: state })) {
     return `✅ Added *set digital pin ${pin} to ${state}* block.`;
  }
  return "⚠️ Failed to add set digital pin block.";
}
// turn right
  
const turnRightMatch = lower.match(/turn\s+right\s+(\d+)(?:\s+degrees?)?/i);
  if (turnRightMatch) {
const angle = turnRightMatch[1];
if (addBlockToWorkspace("magicbit_motor", { SIDE: "LEFT", DIR: "FWD", SPEED: 50 })) {
  return `✅ Added *turn right* block (left motor forward at 50% speed).`;
}
return "⚠️ Failed to add turn right block.";
}

//turn left
const turnLeftMatch = lower.match(/turn\s+left\s+(\d+)(?:\s+degrees?)?/i);
if (turnLeftMatch) {
const angle = turnLeftMatch[1];
if (addBlockToWorkspace("magicbit_motor", { SIDE: "RIGHT", DIR: "FWD", SPEED: 50 })) {  
  return `✅ Added *turn left* block (right motor forward at 50% speed).`;
}
return "⚠️ Failed to add turn left block.";
}

// match "read analog pin 32"
const analogMatch = lower.match(/read\s+analog\s+pin\s+(\d+)/i);
if (analogMatch) {
  const pin = analogMatch[1];
  if (addBlockToWorkspace("magicbit_read_analog", { PIN: pin })) {
    return `✅ Added *read analog pin ${pin}* block.`;
  }
  return "⚠️ Failed to add analog read block.";
}

// match: set pwm pin 15 as 120
const pwmMatch = lower.match(/set\s+pwm\s+pin\s+(\d+)\s+as\s+(\d+)/i);
if (pwmMatch) {
const pin = pwmMatch[1];
const value = pwmMatch[2];
if (addBlockToWorkspace("magicbit_set_pwm", { PIN: pin, VALUE: value })) {
  return `✅ Added *set PWM pin ${pin} as ${value}* block.`;
}
return "⚠️ Failed to add set PWM block.";
}

// match: set servo on pin 15 angle 90
const servoMatch = lower.match(/set\s+servo\s+(?:on\s+)?pin\s+(\d+)\s+angle\s+(\d+)/i);
if (servoMatch) {
const pin = servoMatch[1];
const angle = servoMatch[2];
if (addBlockToWorkspace("magicbit_set_servo", { PIN: pin, ANGLE: angle })) {
  return `✅ Added *set servo on pin ${pin} angle ${angle}* block.`;
}
return "⚠️ Failed to add servo block.";
}


// match: sense touch on pin 4
const touchMatch = lower.match(/sense\s+touch\s+on\s+pin\s+(\d+)/i);
if (touchMatch) {
const pin = touchMatch[1];
if (addBlockToWorkspace("magicbit_touch", { PIN: pin })) {
  return `✅ Added *sense touch on pin ${pin}* block.`;
}
return "⚠️ Failed to add sense touch block.";
}

// match: read button left
const buttonMatch = lower.match(/read\s+button\s+(left|right)/i);
if (buttonMatch) {
const button = buttonMatch[1];
if (addBlockToWorkspace("magicbit_read_button", { BUTTON: button })) {
  return `✅ Added *read button ${button}* block.`;
}
return "⚠️ Failed to add read button block.";
}

// match: read ultrasonic at pin 5
const ultrasonicMatch = lower.match(/read\s+ultrasonic\s+(?:at\s+)?pin\s+(\d+)/i);
if (ultrasonicMatch) {
const pin = ultrasonicMatch[1];
if (addBlockToWorkspace("magicbit_ultrasonic", { PIN: pin })) {
  return `✅ Added *read ultrasonic at pin ${pin}* block.`;
}
return "⚠️ Failed to add ultrasonic block.";
}



//move

  const moveMatch = lower.match(/move (\d+) steps/);
  if (moveMatch) {
    const steps = moveMatch[1];
    if (addBlockToWorkspace("magicbit_motor", { SIDE: "LEFT", DIR: "FWD", SPEED: 50 })) {
      return `✅ Added *move forward* block with left motor at 50% speed.`;
    }
    return "⚠️ Failed to add move block.";
  }
  //display

  const displayTextMatch = lower.match(/display text ["']?(.+?)["']? at x (\d+) y (\d+)/);
  if (displayTextMatch) {
    const message = displayTextMatch[1];
    const x = displayTextMatch[2];
    const y = displayTextMatch[3];
    if (addBlockToWorkspace("magicbit_display_text", { TEXT: message, X: x, Y: y })) {
      return `✅ Added *display text "${message}" at (${x},${y})* block.`;
    }
    return "⚠️ Failed to add display text block.";
  }

  // simple info command
  if (lower.includes("magicbit blocks") || lower.includes("list blocks")) {
    return `🟦 Available Magicbit blocks:\n${blockList}`;
  }

  // show current blocks
  if (lower.includes("show blocks") || lower.includes("current blocks") || lower.includes("what blocks")) {
    const currentXML = getCurrentWorkspaceXML();
    if (currentXML) {
      const xmlText = Blockly.Xml.domToText(currentXML);
      return `📋 Current blocks in workspace:\n\`\`\`xml\n${xmlText}\n\`\`\``;
    } else {
      return "📋 No blocks currently in the workspace.";
    }
  }

  // clear workspace
  if (lower.includes("clear") || lower.includes("clear all") || lower.includes("reset")) {
    const workspace = (workspaceRef && workspaceRef.current) ? workspaceRef.current : Blockly.getMainWorkspace();
    if (workspace) {
      workspace.clear();
      workspace.render();
      return "🧹 Workspace cleared!";
    }
    return "⚠️ Failed to clear workspace.";
  }

  // help command
  if (lower.includes("help") || lower.includes("what can you do")) {
    return `🤖 I can help you with Magicbit blocks! Here's what I can do:

📋 **Commands:**
• "show blocks" - See current blocks in workspace
• "clear" - Clear all blocks
• "magicbit blocks" - List available block types with parameters

💬 **Natural language examples:**
• "Add a servo block that turns to 90 degrees on pin 15"
• "Make the robot move forward when up arrow is pressed"
• "Add a delay of 2 seconds"
• "Show text 'Hello' at position x=10, y=20"
• "Set pin 13 to HIGH"
• "Add a NeoPixel on pin 18 with red color (255,0,0)"
• "Read analog value from pin 32"
• "When 'a' key is pressed, turn the robot left"

🔧 **I can modify existing blocks or create new ones based on your requests!**
📝 **I now have full parameter details for all blocks, so I can create more accurate code.**
⚠️ **Note: I can only use the Magicbit blocks listed above - no standard Blockly control structures.**
💡 **For button events: blocks work as event handlers, so no loops needed!**`;
  }

  return null;
};

const handleSend = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
  if (!input.trim()) return;

  const userMessage = { role: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setLoading(true);

  const localResponse = handleCommand(input);
  if (localResponse) {
    setMessages((prev) => [...prev, { role: "ai", text: localResponse }]);
    setLoading(false);
    return;
  }

  // fallback to Gemini with block list included
  try {
    const apiKey = "AIzaSyD2o7sXV8577lISSvLVG4YbQkXdNM5zh-Q";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Get current workspace XML
    const currentXML = getCurrentWorkspaceXML();
    const currentXMLString = currentXML ? Blockly.Xml.domToText(currentXML) : "No existing blocks";

    const payload = {
contents: [{
  role: "user",
  parts: [{
         text: `You are a Blockly assistant for Magicbit. Here are the available blocks: ${blockList}

Current workspace XML:
${currentXMLString}

User request: ${input}

IMPORTANT: Only use the Magicbit blocks listed above. Do NOT use standard Blockly control blocks like controls_forever, controls_if, logic_compare, etc. These are not available in this workspace.

**CRITICAL: For ANY user input or button press events, you MUST use keyboard blocks:**
- Use \`keyboard_when_key_pressed\` for arrow keys (up, down, left, right)
- Use \`keyboard_when_custom_key_pressed\` for other keys (a, space, 1, etc.)
- These blocks work as event handlers and don't need loops

For button/keyboard events: blocks can be added independently without loops since they work as event handlers.

Please modify the current blocks or create new ones based on the user's request. Reply ONLY with valid Blockly XML using only the available Magicbit blocks. Do not explain or use markdown.`
  }]
}],
generationConfig: {
  temperature: 0.2,
  maxOutputTokens: 800
}
};


    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

    const data = await res.json();
    const aiAnswer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "⚠️ No answer from Gemini.";


    let rawXml = aiAnswer.trim();

// Remove markdown fences if present
if (rawXml.startsWith("```xml")) {
rawXml = rawXml.replace(/^```xml/, "").replace(/```$/, "").trim();
} else if (rawXml.startsWith("```")) {
rawXml = rawXml.replace(/^```/, "").replace(/```$/, "").trim();
}
//xml

if (rawXml.startsWith("<xml")) {
  try {
    // Replace the entire workspace with the new XML
    if (replaceWorkspaceWithXML(rawXml)) {
      setMessages((prev) => [...prev, { role: "ai", text: "✅ Workspace updated with new blocks!" }]);
    } else {
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Failed to update workspace." }]);
    }
    return;
  } catch (err) {
    console.error("XML Parse Error:", err);
    setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Failed to parse XML blocks." }]);
    return;
  }
}
setMessages((prev) => [...prev, { role: "ai", text: aiAnswer }]);
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "⚠️ Sorry, an AI error occurred. Please try again later." },
    ]);
  }
  setLoading(false);
};

  return (
          <div
        className={getChatbotClasses()}
      >


      {/* Helper Bubble - Only visible in mini pill state */}
      {collapseLevel === 2 && (
        <div className="helper-bubble">
          <div className="bubble-content">
            Need a hand? Looks like I can help you out!
          </div>
        </div>
      )}

      {/* Main chatbot container */}
      <div className="chatbot-main">
        {/* Header */}
        <div className="chatbot-header-modern">
          {/* Left side - dots grid */}
          <div className="dots-menu">
            <div className="dots-grid">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>

          {/* Center - Avatar and info */}
          <div className="header-center">
            <div className="avatar-container">
              <Image
                src={chatbotImg}
                alt="Neo AI"
                width={32}
                height={32}
                className="avatar-img"
              />
              <div className="avatar-status active"></div>
            </div>
            {collapseLevel < 2 && (
              <div className="user-info">
                <div className="user-name">Neo</div>
                <div className="user-status">AI Assistant</div>
              </div>
            )}
          </div>

          {/* Right side - chevron */}
          <div className="header-controls">
            <button
              className="collapse-btn"
              onClick={toggleCollapseLevel}
              title="Toggle chatbot size"
            >
              <FaChevronRight 
                className={`chevron-icon ${collapseLevel === 0 ? 'rotated' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Messages area - only show in expanded mode */}
        {collapseLevel === 0 && (
          <>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="message ai-message typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="input-container">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      handleSend(e);
                    }
                  }}
                  placeholder="Hey! Can you help me with...."
                  className="chatbot-input"
                />
                <button
                  onClick={handleSend}
                  className="send-btn"
                  disabled={!input.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 21L21 12L3 3L7 12L3 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
