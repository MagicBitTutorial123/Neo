const usbUpload = async (code, portRef) => {
  const currentCode = code.trim();
  console.log(currentCode);
  if (!currentCode) {
    console.error("No code to upload");
    return;
  }
  if (!("serial" in navigator)) {
    console.error("Web Serial API is not supported in this browser.");
    return;
  }
  let port = portRef.current;
  let writer = null;

  try {
    if (!port || !port.readable || !port.writable) {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
    }

    if (port.writable.locked) {
      console.log("port busy");
      return;
    }

    

    const encoder = new TextEncoderStream();
    const outputDone = encoder.readable.pipeTo(port.writable);
    writer = encoder.writable.getWriter();

    await writer.write('\x03'); // Ctrl+C to interrupt
    await new Promise((r) => setTimeout(r, 20));
    await writer.write('\x01'); // Ctrl+A - enter raw REPL
    await new Promise((r) => setTimeout(r, 20));
    await writer.write('\x02'); // Ctrl+B - return to normal REPL
    await new Promise((r) => setTimeout(r, 100));

    await writer.write("f = open('main.py', 'w')\r\n");
    
    await writer.write(`f.write(${JSON.stringify("from machine import Pin\n")})\r\n`);
    await writer.write(`f.write(${JSON.stringify("for i in [21,22,26,27,4,2,12,13,14,15,5,32,33,16,17,18]:\n")})\r\n`);
    await writer.write(`f.write(${JSON.stringify("    Pin(i, Pin.OUT).value(0)\n")})\r\n`);

    // await writer.write(`f.write(for i in range(10):\r\n`);
    // const line = `Pin(i, Pin.OUT).value(0)`
    // const sanitized = JSON.stringify('\t'+line + "\n");
    // await new Promise((r) => setTimeout(r, 20));

    await writer.write("f.write('async def mainLoop():\\n')\r\n");


    for (const line of currentCode.split("\n")) {
      const sanitized = JSON.stringify("\t"+line + "\n");
      await writer.write(`f.write(${sanitized})\r\n`);
      await new Promise((r) => setTimeout(r, 20));
    }

    await writer.write("f.close()\r\n");
    await writer.write("f = open('reset.txt', 'w')\r\n");
    await new Promise((r) => setTimeout(r, 20));
    await writer.write("f.write('1')\r\n");
    await new Promise((r) => setTimeout(r, 20));
    await writer.write("f.close()\r\n");
    await new Promise((r) => setTimeout(r, 500));

    await writer.write('\x04');
    await writer.write('\x04');


    await writer.close();
    await outputDone;

    alert("Upload complete!");
  } catch (error) {
    console.error("Error uploading code:", error);
  }
};

export { usbUpload };
