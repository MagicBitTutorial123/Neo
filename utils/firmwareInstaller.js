import { ESPLoader, Transport } from 'esptool-js';

const firmwareInstaller = async (portRef, onProgress, abortSignal) => {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial API is not supported in this browser.");
  }

  let port = portRef.current;
  let esploader = null;
  
  // Check for cancellation
  const checkCancelled = () => {
    if (abortSignal?.aborted) {
      throw new Error("Installation cancelled by user");
    }
  };

  try {
    // Only request port if we don't have one at all
  if (!port) {
    port = await navigator.serial.requestPort();
    portRef.current = port;
  }

    // Only open port if it's not already open and accessible
  if (!port.readable || !port.writable) {
    await port.open({ baudRate: 115200 });
  }

    if (onProgress) onProgress(0, `Initializing ESP32 connection...`);
    checkCancelled();

    if (onProgress) onProgress(5, `Connecting to ESP32...`);
    checkCancelled();
    
    // First, try to connect via serial and check for MicroPython
    const needsMicroPython = await checkIfMicroPythonNeeded(port, onProgress);
    checkCancelled();
    
    if (needsMicroPython) {
      if (onProgress) onProgress(10, `MicroPython not detected. Initializing ESP32 flashing...`);
      checkCancelled();

      // Ensure port is closed before handing control to ESPLoader
      try {
        if (port && (port.readable || port.writable)) {
          // Release any locks
          if (port.readable?.locked && port.readable?.getReader) {
            try { await port.readable.getReader().cancel(); } catch {}
          }
          // Close the port if it's open
          await port.close();
        }
      } catch {}

      // Initialize ESPLoader only when we need to flash firmware
      const espLoaderTerminal = {
        clean() {
          console.clear();
        },
        writeLine(data) {
          console.log(data);
        },
        write(data) {
          console.log(data);
        },
      };

      try {
        // Create transport explicitly to avoid undefined transport errors
        const transport = new Transport(port);
        esploader = new ESPLoader({
          transport,
          baudrate: 115200,
          terminal: espLoaderTerminal,
          debugLogging: false,
        });

        if (onProgress) onProgress(12, `Connecting to ESP32 for firmware flashing...`);

        // Detect connected chip and start flasher stub
        await esploader.detectChip();
        await esploader.runStub();
      } catch (espError) {
        console.error("ESPLoader initialization error:", espError);
        throw new Error(`Failed to initialize ESP32 connection: ${espError.message}`);
      }
    } else {
      if (onProgress) onProgress(10, `MicroPython detected. Skipping firmware flash...`);
    }
    
         if (needsMicroPython) {
       if (onProgress) onProgress(15, `Flashing MicroPython firmware...`);
       checkCancelled();
       await flashMicroPythonFirmware(esploader, onProgress, abortSignal);
       checkCancelled();
       if (onProgress) onProgress(40, `MicroPython flashed successfully. Preparing to install Python files...`);
      // Important: release ESPLoader transport so we can use the port for REPL
      try {
        await esploader.transport.disconnect();
      } catch (e) {
        console.log("Error disconnecting ESPLoader transport (ignored):", e);
      }
      esploader = null;
      // Ensure the serial port is fully free before continuing
      try {
        if (port?.readable?.locked || port?.writable?.locked) {
    await port.close();
        }
      } catch {}
      // Short delay to allow device reboot and port settle
      await new Promise(r => setTimeout(r, 1000));
    } else {
      if (onProgress) onProgress(12, `MicroPython found. Loading Python files...`);
    }

    // Load firmware files dynamically from the API
    checkCancelled();
    if (onProgress) onProgress(15, `Loading Python files...`);
    
    let firmwareFiles;
    try {
      const response = await fetch('/api/python-files');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to load Python files from server');
      }
      
      firmwareFiles = data.files;
      console.log(`Loaded ${firmwareFiles.length} Python files:`, firmwareFiles.map(f => f.name));
    } catch (error) {
      console.error('Error loading Python files:', error);
      throw new Error(`Failed to load Python files: ${error.message}`);
    }

    // Now install the Python files via REPL
    checkCancelled();
    const installedCount = await installPythonFiles(port, firmwareFiles, onProgress, abortSignal);
    checkCancelled();

    // Installation complete
    if (onProgress) onProgress(100, `Firmware installation complete!`);
    
    return {
      success: true,
      message: `Successfully installed ${installedCount} firmware files with MicroPython`,
      filesInstalled: installedCount
    };

  } catch (error) {
    console.error("Error during firmware installation:", error);
    throw error;
  } finally {
    // Clean up ESP loader connection
    if (esploader) {
      try {
        await esploader.transport.disconnect();
      } catch (e) {
        console.log("Error disconnecting ESP loader:", e);
      }
    }
  }
};

// Function to check if MicroPython firmware needs to be flashed
export const checkIfMicroPythonNeeded = async (port, onProgress) => {
  let writer = null;
  let reader = null;
  
  try {
    if (onProgress) onProgress(7, `Checking for existing MicroPython...`);
    
    // Check if port is locked
    if (port.writable.locked || port.readable.locked) {
      console.log('Port is locked, assuming no MicroPython');
      return true; // Assume we need to flash if port is locked
    }
    
    // Open port if not already open
    if (!port.readable || !port.writable) {
      await port.open({ baudRate: 115200 });
    }
    
    // Set up writer and reader
    writer = port.writable.getWriter();
    reader = port.readable.getReader();

    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    // Try to communicate with MicroPython REPL
    // Send Ctrl+C a couple of times to break out of any running program
    await writer.write(new Uint8Array([0x03]));
    await new Promise((resolve) => setTimeout(resolve, 100));
    await writer.write(new Uint8Array([0x03]));
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Try to switch to friendly REPL just in case we are in raw mode
    await writer.write(new Uint8Array([0x02])); // Ctrl+B
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send newline to get prompt, then the print command
    await writer.write(textEncoder.encode('\r\n'));
    await new Promise((resolve) => setTimeout(resolve, 100));
    await writer.write(textEncoder.encode('print("micropython_check")\r\n'));

    // Read response with a real timeout loop (max ~3000ms)
    let response = '';
    const startMs = Date.now();
    const readWithTimeout = async (ms) =>
      Promise.race([
        reader.read(),
        new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), ms)),
      ]);

    try {
      while (Date.now() - startMs < 3000) {
        const result = await readWithTimeout(200);
        if (result && result.timeout) {
          continue;
        }
        const { value, done } = result;
        if (done) {
          break;
        }
        if (value && value.length) {
          const chunk = textDecoder.decode(value);
          response += chunk;
          if (response.includes('micropython_check') || response.includes('>>>') || response.includes('MicroPython')) {
            break;
          }
        }
      }
      if (response) {
        console.log('MicroPython check response:', response);
      }
    } catch (readError) {
      console.log('Error reading MicroPython response:', readError);
    } finally {
      // If a read is pending, cancel it to avoid hanging
      try { await reader.cancel(); } catch (cancelError) { console.log('Reader cancel error:', cancelError); }
    }
    
    // Check if response contains MicroPython indicators
    const hasMicroPython = response.includes('micropython_check') || 
                          response.includes('>>>') || 
                          response.includes('MicroPython');
    
    if (hasMicroPython) {
      if (onProgress) onProgress(9, `MicroPython detected on device`);
      return false; // Don't need to flash
    } else {
      if (onProgress) onProgress(9, `MicroPython not detected or not responding`);
      return true; // Need to flash
    }
    
  } catch (error) {
    console.log("Error checking for MicroPython:", error);
    if (onProgress) onProgress(9, `Could not detect MicroPython - will install`);
    return true; // Flash if we can't determine
  } finally {
    // Clean up resources
    try {
      if (writer) {
        await writer.releaseLock();
      }
    } catch (writerError) {
      console.log('Writer cleanup error:', writerError);
    }
    
    try {
      if (reader) {
        await reader.releaseLock();
      }
    } catch (readerError) {
      console.log('Reader cleanup error:', readerError);
    }
  }
};

// Function to flash MicroPython firmware using esptool-js
const flashMicroPythonFirmware = async (esploader, onProgress, abortSignal) => {
  const checkCancelled = () => {
    if (abortSignal?.aborted) {
      throw new Error("Installation cancelled by user");
    }
  };
  try {
    if (onProgress) onProgress(20, `Loading MicroPython firmware binary...`);
    
    // Load the MicroPython firmware binary via API route to access local file
    const firmwareFile = 'ESP32_GENERIC-20250809-v1.26.0.bin';
    const response = await fetch(`/api/firmware/${encodeURIComponent(firmwareFile)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load firmware binary: ${response.statusText}`);
    }
    
    const firmwareData = await response.arrayBuffer();
    
    if (onProgress) onProgress(25, `Preparing ESP32 for firmware flash...`);
    
    // Erase entire flash first
    if (onProgress) onProgress(30, `Erasing flash memory...`);
    await esploader.eraseFlash();

    if (onProgress) onProgress(35, `Writing MicroPython firmware...`);

    // Flash the MicroPython firmware at address 0x1000 (standard for ESP32)
    const flashAddress = 0x1000;
    const bin = new Uint8Array(firmwareData);
    const totalSize = bin.length;

    // Begin flashing (calculates erase/writes as needed inside)
    const numBlocks = await esploader.flashBegin(totalSize, flashAddress);
    const blockSize = 0x4000; // 16KB matches loader's FLASH_WRITE_SIZE

    for (let seq = 0; seq < numBlocks; seq++) {
      checkCancelled(); // Check cancellation during firmware flashing
      const start = seq * blockSize;
      const end = Math.min(start + blockSize, totalSize);
      const chunk = bin.slice(start, end);
      await esploader.flashBlock(chunk, seq, esploader.DEFAULT_TIMEOUT);
      const progress = 35 + ((end / totalSize) * 5); // keep same 35-40% window
      if (onProgress) onProgress(progress, `Writing firmware: ${Math.round((end / totalSize) * 100)}%`);
    }

    if (onProgress) onProgress(40, `Finalizing firmware installation...`);
    await esploader.flashFinish(true); // reboot after flashing
    
    if (onProgress) onProgress(42, `MicroPython firmware installed successfully`);
    
    // Wait a moment for the ESP32 to reboot
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error("Error flashing MicroPython firmware:", error);
    throw new Error(`Failed to flash MicroPython firmware: ${error.message}`);
  }
};

// Function to install Python files via REPL (after MicroPython is flashed)
const installPythonFiles = async (port, firmwareFiles, onProgress, abortSignal) => {
  const checkCancelled = () => {
    if (abortSignal?.aborted) {
      throw new Error("Installation cancelled by user");
    }
  };
  let encoder = null;
  let outputDone = null;
  let writer = null;
  
  try {
    // Only close and reopen if streams are locked or port is not accessible
    if (port?.readable?.locked || port?.writable?.locked) {
      console.log("Port streams are locked, attempting to reset...");
      try { await port.close(); } catch {}
      await port.open({ baudRate: 115200 });
    } else if (!port.readable || !port.writable) {
      console.log("Port not accessible, opening...");
    await port.open({ baudRate: 115200 });
    } else {
      console.log("Using existing open port connection");
    }
    
    // Wait for MicroPython to be ready after boot
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use the same efficient approach as usbUpload.js
    encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    writer = encoder.writable.getWriter();
    
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Simple REPL entry (like usbUpload.js)
    await writer.write('\x03'); // Ctrl+C to interrupt
    await sleep(20);
    await writer.write('\x01'); // Ctrl+A - enter raw REPL  
    await sleep(20);
    await writer.write('\x02'); // Ctrl+B - return to normal REPL
    await sleep(100);

    let installedCount = 0;
    const totalFiles = firmwareFiles.length;

    for (const file of firmwareFiles) {
      checkCancelled();
      if (onProgress) onProgress(
        20 + (installedCount / totalFiles) * 75, 
        `Installing ${file.name}...`
      );

      console.log(`Writing ${file.name}...`);
      
      // Open file for writing
      await writer.write(`f = open('${file.name}', 'w')\r\n`);
      
      // Write content line by line (simple and fast like usbUpload.js)
      const lines = file.content.split('\n');
      for (const line of lines) {
        checkCancelled(); // Check cancellation during file writing
        await writer.write(`f.write(${JSON.stringify(line + '\n')})\r\n`);
        await sleep(10);
      }
      
      // Close file
      await writer.write("f.close()\r\n");
      
      installedCount++;
      if (onProgress) onProgress(
        20 + (installedCount / totalFiles) * 75, 
        `Installed ${file.name} (${installedCount}/${totalFiles})`
      );
    }

    // Clean exit
    try { await writer.close(); } catch {}
    try { await outputDone; } catch {}
    try { await port.close(); } catch {}
    
    return installedCount;
    
  } catch (error) {
    console.error("Error installing Python files:", error);
    throw error;
  }
};

export { firmwareInstaller };