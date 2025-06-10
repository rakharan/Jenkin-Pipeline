"use strict";
// src/main.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = add;
/**
 * A simple function to add two numbers.
 * This represents the "business logic" of your application.
 * @param a The first number.
 * @param b The second number.
 * @returns The sum of the two numbers.
 */
function add(a, b) {
    return a + b;
}
/**
 * The main execution block of the application.
 * This will run when you execute the compiled JavaScript file with Node.js.
 */
function main() {
    const x = 5;
    const y = 10;
    const result = add(x, y);
    console.log(`The sum of ${x} and ${y} is: ${result}`);
}
// This construct ensures that main() is called only when the script is executed directly.
if (require.main === module) {
    main();
}
