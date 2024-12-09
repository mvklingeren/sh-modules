// timer.ts

// Declare external functions
declare function postMessage(ptr: number, length: number): void;
declare function getCurrentTime(): number;

// State variables
let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Helper function to send messages
function sendMessage(message: string): void {
  // Convert the string to UTF8 bytes
  const encoded = String.UTF8.encode(message);

  // Create a new Uint8Array to hold the message
  const buffer = new Uint8Array(encoded.byteLength);

  // Copy the encoded message into the buffer
  for (let i = 0; i < encoded.byteLength; i++) {
    buffer[i] = load<u8>(changetype<usize>(encoded) + i);
  }

  // Get the pointer to the buffer's data
  const ptr = changetype<usize>(buffer.buffer);

  // Send the message
  postMessage(ptr as i32, buffer.length);
}

// Single tick function that checks and updates timer state
export function tick(): void {
  if (!isRunning) return;

  const currentTime = getCurrentTime();
  const elapsed = currentTime - lastTime;

  if (elapsed >= INTERVAL) {
    const tickMessage = "TICK:" + currentTime.toString();
    sendMessage(tickMessage);
    lastTime = currentTime;
  }
}

// Start the timer
export function run(): void {
  if (!isRunning) {
    isRunning = true;
    lastTime = getCurrentTime();
    const startMessage = "START:" + lastTime.toString();
    sendMessage(startMessage);
    tick();
  }
}

// Stop the timer
export function stop(): void {
  isRunning = false;
  const stopMessage = "STOP:" + getCurrentTime().toString();
  sendMessage(stopMessage);
}

// Reset timer
export function reset(): void {
  lastTime = getCurrentTime();
  if (isRunning) {
    const resetMessage = "RESET:" + lastTime.toString();
    sendMessage(resetMessage);
  }
}