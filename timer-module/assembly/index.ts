// timer.ts
declare function postMessage(ptr: number, length: number): void;
declare function getCurrentTime(): number;

let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Helper function to send messages
function sendMessage(message: string): void {
  const encoded = String.UTF8.encode(message);
  postMessage(changetype<i32>(encoded), encoded.byteLength);
}

// Internal timer check
function checkTimer(): void {
  if (!isRunning) return;

  const currentTime = getCurrentTime();
  if (currentTime - lastTime >= INTERVAL) {
    lastTime = currentTime;
    // Send simple string message instead of JSON
    sendMessage("TICK:" + currentTime.toString());
  }

  // Continue the loop while running
  if (isRunning) {
    checkTimer();
  }
}

// Start the timer
export function run(): void {
  if (!isRunning) {
    isRunning = true;
    lastTime = getCurrentTime();
    sendMessage("START:" + lastTime.toString());
    checkTimer();
  }
}

// Stop the timer
export function stop(): void {
  isRunning = false;
  sendMessage("STOP:" + getCurrentTime().toString());
}

// Reset timer
export function reset(): void {
  lastTime = getCurrentTime();
  if (isRunning) {
    sendMessage("RESET:" + lastTime.toString());
  }
}
