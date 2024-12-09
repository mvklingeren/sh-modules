// timer.ts

// Declare external functions - note we'll implement these on the Node.js side
declare function postMessage(ptr: number, length: number): void;
declare function getCurrentTime(): number;

// State variables
let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Create a fixed buffer for our messages
const MSG_BUFFER_SIZE = 256; // Size for our message buffer
let messageBuffer: ArrayBuffer;

// Initialize the message buffer
export function init(): void {
  messageBuffer = new ArrayBuffer(MSG_BUFFER_SIZE);
}

// Helper function to send messages using our fixed buffer
function sendMessage(message: string): void {
  // Get the UTF8 bytes of our message
  const bytes = String.UTF8.encode(message);

  // Copy the bytes into our fixed buffer
  memory.copy(
    changetype<usize>(messageBuffer),
    changetype<usize>(bytes),
    bytes.byteLength
  );

  // Send the message using our fixed buffer's pointer
  postMessage(changetype<i32>(messageBuffer), bytes.byteLength);
}

// Single tick function that checks and updates timer state
export function tick(): void {
  if (!isRunning) return;
  
  const currentTime = getCurrentTime();
  const elapsed = currentTime - lastTime;
  
  if (elapsed >= INTERVAL) {
    sendMessage(`TICK:${currentTime}`);
    lastTime = currentTime;
  }
}

// Start the timer
export function run(): void {
  if (!isRunning) {
    isRunning = true;
    lastTime = getCurrentTime();
    sendMessage(`START:${lastTime}`);
    tick();
  }
}

// Stop the timer
export function stop(): void {
  isRunning = false;
  sendMessage(`STOP:${getCurrentTime()}`);
}

// Reset timer
export function reset(): void {
  lastTime = getCurrentTime();
  if (isRunning) {
    sendMessage(`RESET:${lastTime}`);
  }
}