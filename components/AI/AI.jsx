import React, { useState, useRef, useEffect } from "react";
import * as Blockly from "blockly";



const AI = ({ onClose, workspaceRef }) => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI assistant. How can I help you with Magicbit blocks today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  const addBlockToWorkspace = (type, fields = {}, offset = [20, 20]) => {
    const workspace = workspaceRef?.current;
    if (!workspace) return false;

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
    e.preventDefault();
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
    Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);
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
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background: m.role === "user" ? "#4f8cff" : "#e5e7eb",
                color: m.role === "user" ? "#fff" : "#222",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} style={styles.inputArea}>
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your command..."
          style={{
            flex: 1,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 15,
            color: "#000", 
            background: "#fff"
          }}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    background: "#f7f7f8",
  },
  message: {
    display: "flex",
    marginBottom: "10px",
  },
  bubble: {
    maxWidth: "75%",
    padding: "10px 15px",
    borderRadius: "16px",
    fontSize: "14px",
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "10px",
    background: "#fff",
  },
  button: {
    marginLeft: "8px",
    padding: "0 16px",
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default AI;