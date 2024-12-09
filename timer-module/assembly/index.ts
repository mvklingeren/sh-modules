// timer.ts

// Declare external functions
declare function postMessage(ptr: number, length: number): void;
declare function getCurrentTime(): number;

// State variables
let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Helper function to send messages - simplified
function sendMessage(message: string): void {
  // String.UTF8.encode returns a valid pointer to UTF8 encoded data
  const messagePtr = String.UTF8.encode(message);
  // Send the pointer and length to JavaScript
  postMessage(changetype<i32>(messagePtr), messagePtr.byteLength);
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