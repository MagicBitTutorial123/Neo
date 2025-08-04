import React, { useState, useRef, useEffect } from 'react';
import { FaChevronRight, FaRegPaperPlane } from "react-icons/fa";
import * as Blockly from "blockly";
import downloadImg from '@/assets/download.png';
import ChatBubbleSVG from "@/assets/chat-bubble.svg";
import Image from 'next/image';



export default function AIChatbot({ position = "right", workspaceRef,onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI assistant. How can I help you with Magicbit blocks today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [collapseLevel, setCollapseLevel] = useState(0);
  // draggable position
  const chatbotRef = useRef(null);
  const posRef = useRef({ x: 20, y: 430 }); 

  // block list for Gemini to know
  const blockList = `
- magicbit_set_digital: sets a digital pin high/low
- magicbit_clear_display: clears the OLED
- magicbit_display_text: writes text on the OLED at x,y
- magicbit_set_pwm: sets PWM duty on a pin
- magicbit_set_servo: sets servo angle
- magicbit_read_analog: reads analog pin
- magicbit_touch: reads touch pin
- magicbit_read_button: reads left/right button
- magicbit_ultrasonic: reads ultrasonic distance
- magicbit_read_humidity: reads humidity
- magicbit_neopixel_rgb: sets NeoPixel color
- magicbit_play_tone: plays a tone
- delay_block: adds a delay in seconds
`;
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

//drag

/*useEffect(() => {
  const el = chatbotRef.current;
  if (!el) return;

  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const header = el.querySelector(".chatbot-header");

  const onMouseDown = (e) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Optional visual feedback
    el.style.transition = "none";
    el.style.opacity = "0.95";
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
   const newLeft = e.clientX - startX;
    const newTop = e.clientY - startY;


    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";



    posRef.current = { x: newLeft, y: newTop };
  };

  const onMouseUp = () => {
    isDragging = false;
    el.style.opacity = "1";
    el.style.cursor = "default";

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  if (header) {
    header.style.cursor = "grab";
    header.addEventListener("mousedown", onMouseDown);
  }

  return () => {
    if (header) header.removeEventListener("mousedown", onMouseDown);
  };
}, []);
*/

useEffect(() => {
  const el = chatbotRef.current;
  if (!el) return;

  // 🟡 Delay just enough to ensure offsetHeight is correct
  const timeout = setTimeout(() => {
    if (!el.style.left && !el.style.top) {
      const height = el.offsetHeight;

      // 💡 Fallback to a default height if 0 (safety)
      const defaultHeight = height > 0 ? height : 300;
      const defaultX = 20;
      const defaultY = window.innerHeight - defaultHeight - 20;

      el.style.left = `${defaultX}px`;
      el.style.top = `${defaultY}px`;

      posRef.current = { x: defaultX, y: defaultY };
    }
  }, 50); // 1 frame delay (~16ms), just to be safe

  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  const header = el.querySelector(".chatbot-header");

  const onMouseDown = (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    initialLeft = parseInt(el.style.left, 10) || posRef.current?.x || 0;
    initialTop = parseInt(el.style.top, 10) || posRef.current?.y || 0;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    el.style.transition = "none";
    el.style.opacity = "0.95";
    el.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newLeft = initialLeft + dx;
    const newTop = initialTop + dy;

    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";

    posRef.current = { x: newLeft, y: newTop };
  };

  const onMouseUp = () => {
    isDragging = false;
    el.style.opacity = "1";
    el.style.cursor = "default";

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  if (header) {
    header.style.cursor = "grab";
    header.addEventListener("mousedown", onMouseDown);
  }

  return () => {
    clearTimeout(timeout);
    if (header) header.removeEventListener("mousedown", onMouseDown);
  };
}, []);




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
if (addBlockToWorkspace("motion_turn_right", { ANGLE: angle })) {
  return `✅ Added *turn right ${angle} degrees* block.`;
}
return "⚠️ Failed to add turn right block.";
}

//turn left
const turnLeftMatch = lower.match(/turn\s+left\s+(\d+)(?:\s+degrees?)?/i);
if (turnLeftMatch) {
const angle = turnLeftMatch[1];
if (addBlockToWorkspace("motion_turn_left", { ANGLE: angle })) {  
  return `✅ Added *turn left ${degrees} degrees* block.`;
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
    if (addBlockToWorkspace("motion_move_steps", { STEPS: steps })) {
      return `✅ Added *move ${steps} steps* block.`;
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

    const payload = {
contents: [{
  role: "user",
  parts: [{
    text: `You are a Blockly assistant. Reply ONLY with valid Blockly XML using these blocks: ${blockList}. Do not explain or use markdown. Convert this to blocks: ${input}`
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
console.log("AI Raw XML Response:\n", rawXml);

if (rawXml.startsWith("<xml")) {
  try {
    const xmlDom = Blockly.utils.xml.textToDom(rawXml);
    const workspace = (workspaceRef && workspaceRef.current) ? workspaceRef.current : Blockly.getMainWorkspace();
    if (!workspace) {
    setMessages(prev => [...prev, { role: "ai", text: "⚠️ Blockly workspace not ready yet. Try again in a moment." }]);
    setLoading(false);
    return;
}

    Blockly.Xml.domToWorkspace(xmlDom, workspace);
    setMessages((prev) => [...prev, { role: "ai", text: "✅ Blocks added to the workspace." }]);
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
      className="chatbot-wrapper"
       ref={chatbotRef}
    style={{
    position: "fixed",
    top: posRef.current.y,
    left: posRef.current.x,
    zIndex: 99999,
    transition: "opacity 0.2s ease",

  }}
      
    >
      {/* Bubble absolutely above the minimized widget */}
      {collapseLevel === 2 && (
        <div style={{ position: "relative", width: "210px", height: "60px" }}>
  <Image
    src={ChatBubbleSVG}
    alt="Bubble"
    style={{ width: "100%", height: "100%" }}
  />
  <div
    style={{
      position: "absolute",
      top: "12px",
      left: "16px",
      color: "#333",
      fontSize: "12.5px",
      fontFamily: 'Poppins, sans-serif',
      lineHeight: "1.4",
      fontWeight: 550,
      
    }}
  >
    Need a hand?Look likes I can? <br />
    help you out!
  </div>
</div>

      )}
      <div className={`chatbot-container collapse-${collapseLevel}`}>
        {/* Header */}
        <div className="chatbot-header">
          {/* Dots grid (always show) */}
          <div className="chatbot-dots-grid">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="dot" />
            ))}
          </div>
          {/* Avatar with active dot */}
          <div className="chatbot-avatar-wrapper">
            <Image
              src={downloadImg}
              alt="Neo"
              className="chatbot-avatar"
            />
            <span className="chatbot-avatar-active" />
          </div>
          {/* Name and role (only in expanded and mini header) */}
          {collapseLevel < 2 && (
            <div className="chatbot-header-info">
              <div className="chatbot-name">Neo</div>
              <div className="chatbot-role">AI Assistant</div>
            </div>
          )}
          {/* Chevron button */}
          <button
            className="chatbot-header-btn"
            title="Toggle"
            onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
          >
            <FaChevronRight className="text-white text-lg" />
          </button>
        </div>
        {/* Messages and input (only in expanded state) */}
        {collapseLevel === 0 && (
          <>
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chatbot-message ${msg.role === "user" ? "user" : "ai"}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div
              className="flex items-center bg-white border-2 border-gray-300 rounded-full px-4 py-2 shadow max-w-xs"
              style={{ marginTop: 8 }}
            >
              <input
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(e)}
                placeholder="Hey! Can you help me with...."
                style={{ border: "none" }}
              />
              <button
                className="ml-2 p-1 rounded-full hover:bg-blue-50 transition"
                onClick={handleSend}
                style={{ border: "none", background: "none" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polygon points="3,21 21,12 3,3 7,12" stroke="#3B82F6" strokeWidth="2" fill="none" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}