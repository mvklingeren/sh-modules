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

// Debug helper
function sendDebug(message: string, time: f64): void {
  sendMessage("DEBUG: " + message + " at time: " + time.toString());
}

// Single tick function that checks and updates timer state
export function tick(): void {
  if (!isRunning) return;

  const currentTime = getCurrentTime();
  const elapsed = currentTime - lastTime;

  // Debug output
  sendDebug("Elapsed: " + elapsed.toString(), currentTime);

  if (elapsed >= INTERVAL) {
    sendMessage("TICK:" + currentTime.toString());
    lastTime = currentTime;
  }
}

// Start the timer
export function run(): void {
    if (!isRunning) {
      isRunning = true;
      lastTime = getCurrentTime();
      sendMessage("START:" + lastTime.toString());
      // Initial tick to start immediately
      tick();
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