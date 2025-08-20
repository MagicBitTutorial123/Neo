const bluetoothUpload = async (allCode, txChar) => {
  if (!txChar) throw new Error("Bluetooth characteristic not available");

  const encoder = new TextEncoder();
  const code = allCode.trim();

  // Start upload
  await txChar.writeValue(
    encoder.encode(JSON.stringify({ mode: "start" }) + "\n")
  );
  await new Promise((r) => setTimeout(r, 50));

  let lines = [
    `from machine import Pin\n`,
    `for i in [21,22,26,27,4,2,12,13,14,15,5,32,33,16,17,18]:\n`,
    `    Pin(i, Pin.OUT).value(0)\n`,
  ];

  for (const line of lines) {
    const payload = JSON.stringify({
      mode: "upload",
      type: "code",
      data: line,
    });
    await txChar.writeValue(encoder.encode(payload + "\n"));
  }


  // Send code line by line
  lines = code.split("\n");
  for (const line of lines) {
    const payload = JSON.stringify({
      mode: "upload",
      type: "code",
      data: line,
    });
    await txChar.writeValue(encoder.encode(payload + "\n"));
  }

  // End upload
  await txChar.writeValue(
    encoder.encode(JSON.stringify({ mode: "end" }) + "\n")
  );
  await new Promise((r) => setTimeout(r, 100));
};

export { bluetoothUpload };
