import assert from "assert";
import fs from "fs";

// Create memory instance first
const memory = new WebAssembly.Memory({ initial: 1 });

// Define the environment for the WebAssembly module
const env = {
    abort: (message, fileName, lineNumber, columnNumber) => {
        const errorMessage = `Abort called: ${message} in ${fileName}:${lineNumber}:${columnNumber}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    },
    memory: memory
};

// Define index imports with access to memory
const indexImport = {
    consoleLog: (ptr, length) => {
        const message = new TextDecoder().decode(
            new Uint8Array(memory.buffer, ptr, length)
        );
        console.log("consoleLog:", message);
    },
    postMessage: (ptr, length) => {
        const message = new TextDecoder().decode(
            new Uint8Array(memory.buffer, ptr, length)
        );
        console.log("postMessage:", message);
    },
    getCurrentTime: () => Date.now() / 1000,
};

try {
    // Read the WebAssembly file synchronously
    const file = fs.readFileSync("./build/debug.wasm");

    // Compile the WebAssembly module
    const wasmModule = new WebAssembly.Module(file);

    // Instantiate the WebAssembly module
    const instance = new WebAssembly.Instance(wasmModule, {
        env,
        index: indexImport
    });

    // Get the exported functions
    const { run } = instance.exports;

    // Test the `run` function
    assert.doesNotThrow(() => run());
    console.log("ok");
} catch (error) {
    console.error("Test failed:", error);
}