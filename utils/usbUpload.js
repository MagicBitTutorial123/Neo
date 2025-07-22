const usbUpload = async (code, portRef) => {

  const currentCode = code.trim();
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
      toast({
        title: "Busy",
        description: "Port is currently busy.",
        variant: "destructive",
      });
      return;
    }

    const encoder = new TextEncoderStream();
    const outputDone = encoder.readable.pipeTo(port.writable);
    writer = encoder.writable.getWriter();

    await writer.write("\x03"); // Ctrl+C
    await new Promise((r) => setTimeout(r, 500));

    await writer.write("f = open('main.py', 'w')\r\n");
    await txChar.writeValue(encoder.encode(`def mainLoop():\n`));
    await new Promise((r) => setTimeout(r, 20));

    for (const line of currentCode.split("\n")) {
      await writer.write(`f.write(${JSON.stringify("\t" + line + "\n")})\r\n`);
      await new Promise((r) => setTimeout(r, 20));
    }

    await writer.write("f.close()\r\n");
    await writer.write("\x04"); // Ctrl+D

    await writer.close();
    await outputDone;
    alert("Upload complete!");

  } catch (error) {
    console.error("Error uploading code:", error);
  }
};

export { usbUpload };