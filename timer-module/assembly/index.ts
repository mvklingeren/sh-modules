// timer.ts

// Declare external functions
declare function emitMessage(type: string, timestamp: f64): void;
declare function getCurrentTime(): f64;

// State variables
let lastTime: f64 = 0;
let isRunning: bool = false;
const INTERVAL: f64 = 1000.0; // 1 second in milliseconds

// Single tick function that checks and updates timer state
export function tick(): void {
  if (!isRunning) return;

  const currentTime = getCurrentTime();
  const elapsed = currentTime - lastTime;

  if (elapsed >= INTERVAL) {
    emitMessage("TICK", currentTime);
    lastTime = currentTime;
  }
}

// Start the timer
export function run(): void {
  if (!isRunning) {
    isRunning = true;
    lastTime = getCurrentTime();
    emitMessage("START", lastTime);
    tick();
  }
}

// Stop the timer
export function stop(): void {
  isRunning = false;
  emitMessage("STOP", getCurrentTime());
}

// Reset timer
export function reset(): void {
  lastTime = getCurrentTime();
  if (isRunning) {
    emitMessage("RESET", lastTime);
  }
}