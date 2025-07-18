const bluetoothUpload = async (allCode, txChar) => {
  if (!txChar) {
    throw new Error("Bluetooth characteristic not available");
  }
  
  const encoder = new TextEncoder();
  allCode = allCode.trim();
  
  try {
    // Start upload mode
    let payload = JSON.stringify({ mode: "start" });
    await txChar.writeValue(encoder.encode(payload + "\n"));
    await new Promise((r) => setTimeout(r, 50)); // Longer initial delay

    // Send code line by line
    const lines = allCode.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const payload = JSON.stringify({
        mode: "upload",
        type: "code",
        data: line,
      });
      
      await txChar.writeValue(encoder.encode(payload + "\n"));
      
      // Add a small delay every few lines to prevent buffer overflow
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    // End upload mode
    payload = JSON.stringify({ mode: "end" });
    await txChar.writeValue(encoder.encode(payload + "\n"));
    await new Promise((r) => setTimeout(r, 100)); // Longer final delay

    console.log("Bluetooth upload completed successfully");
    
  } catch (error) {
    console.error("Bluetooth upload failed:", error);
    throw error; // Re-throw to handle in caller
  }
};

export  {bluetoothUpload};