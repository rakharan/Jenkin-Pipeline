"use strict";
// src/main.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
// 'describe' groups related tests together into a test suite.
describe('add function', () => {
    // 'it' or 'test' defines an individual test case.
    it('should correctly add two positive numbers', () => {
        // The 'expect' function is used to create an assertion.
        // '.toBe()' is a "matcher" that checks for strict equality.
        expect((0, main_1.add)(2, 3)).toBe(5);
    });
    it('should correctly add a positive and a negative number', () => {
        expect((0, main_1.add)(10, -5)).toBe(5);
    });
    it('should correctly add two negative numbers', () => {
        expect((0, main_1.add)(-1, -5)).toBe(-6);
    });
    it('should correctly handle zero', () => {
        expect((0, main_1.add)(100, 0)).toBe(100);
    });
});
