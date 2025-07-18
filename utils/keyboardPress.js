const keyboardSendBLE = async (key, txChar, maxRetries = 3) => {
  if (!txChar) {
    throw new Error("Bluetooth characteristic not available");
  }

  // Validate the key input
  key = key.trim();
  if (!key) {
    throw new Error("Invalid key input");
  }

  const encoder = new TextEncoder();
  const payload = JSON.stringify({
    mode: 'keypress',
    type: "keyboard",
    data: key
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await txChar.writeValue(encoder.encode(payload + "\n"));
      
      // Small delay to prevent flooding the connection
      await new Promise(resolve => setTimeout(resolve, 200));
      return; // Success - exit the function
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed to send key "${key}":`, error);
      
      // Special handling for GATT errors
      const isGattError = error.name === 'NotSupportedError' || 
                         error.message.includes('GATT') ||
                         error.message.includes('disconnected');
      
      if (attempt < maxRetries) {
        // Exponential backoff for retries (100ms, 200ms, 400ms)
        const delay = Math.pow(2, attempt) * 50;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Final attempt failed
        console.error(`Failed to send key after ${maxRetries} attempts`);
        throw new Error(`Bluetooth send failed: ${error.message}`);
      }
    }
  }
};

export { keyboardSendBLE };