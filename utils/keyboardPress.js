// Global throttle state to prevent rapid calls across the entire application
let lastKeyPress = 0;
const globalThrottleDelay = 100; // 100ms minimum between any key presses

const keyboardSendBLE = async (key, txChar, maxRetries = 3) => {
  if (!txChar) {
    throw new Error("Bluetooth characteristic not available");
  }

  // Global throttling to prevent overwhelming BLE connection
  const now = Date.now();
  if (now - lastKeyPress < globalThrottleDelay) {
    console.log(`Global key throttle active, ignoring key "${key}"`);
    return; // Silently ignore rapid key presses
  }
  lastKeyPress = now;

  // Validate the key input
  key = key.trim();
  if (!key) {
    throw new Error("Invalid key input");
  }

  const encoder = new TextEncoder();
  const payload = JSON.stringify({
    mode: "keypress",
    type: "keyboard",
    data: key,
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await txChar.writeValue(encoder.encode(payload + "\n"));

      // Increased delay to prevent flooding the connection
      await new Promise((resolve) => setTimeout(resolve, 250));
      return; // Success - exit the function
    } catch (error) {
      console.error(`Attempt ${attempt} failed to send key "${key}":`, error);

      // Special handling for GATT errors
      const isGattError =
        error.name === "NotSupportedError" ||
        error.message.includes("GATT") ||
        error.message.includes("disconnected") ||
        error.message.includes("Invalid characteristic");

      if (attempt < maxRetries && !isGattError) {
        // Exponential backoff for retries (150ms, 300ms, 600ms)
        const delay = Math.pow(2, attempt) * 75;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Final attempt failed or GATT error
        console.error(`Failed to send key after ${maxRetries} attempts`);
        if (isGattError) {
          throw new Error(`Bluetooth connection lost: ${error.message}`);
        }
        throw new Error(`Bluetooth send failed: ${error.message}`);
      }
    }
  }
};

export { keyboardSendBLE };
