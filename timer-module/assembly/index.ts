// timer.ts
declare function postMessage(ptr: number, length: number): void;
declare function getCurrentTime(): number;

let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Helper function to send messages
function sendMessage(message: string): void {
  const encoded = String.UTF8.encode(message);
  const ptr = changetype<i32>(encoded);
  // Log the encoded message details
  postMessage(ptr, encoded.byteLength);
}

// Single tick function that checks and updates timer state
export function tick(): void {
  if (!isRunning) return;

  const currentTime = getCurrentTime();
  const elapsed = currentTime - lastTime;

  if (elapsed >= INTERVAL) {
    const tickMessage = `TICK:${currentTime}`;
    sendMessage(tickMessage);
    lastTime = currentTime;
  }
}

// Start the timer
export function run(): void {
  if (!isRunning) {
    isRunning = true;
    lastTime = getCurrentTime();
    const startMessage = `START:${lastTime}`;
    sendMessage(startMessage);
    tick();
  }
}

// Stop the timer
export function stop(): void {
  isRunning = false;
  const stopMessage = `STOP:${getCurrentTime()}`;
  sendMessage(stopMessage);
}

// Reset timer
export function reset(): void {
    lastTime = getCurrentTime();
    if (isRunning) {
      const resetMessage = `RESET:${lastTime}`;
      sendMessage(resetMessage);
    }
}