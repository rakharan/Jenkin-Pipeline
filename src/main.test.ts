// src/main.test.ts

import { add } from './main';

// 'describe' groups related tests together into a test suite.
describe('add function', () => {

    // 'it' or 'test' defines an individual test case.
    it('should correctly add two positive numbers', () => {
        // The 'expect' function is used to create an assertion.
        // '.toBe()' is a "matcher" that checks for strict equality.
        expect(add(2, 3)).toBe(5);
    });

    it('should correctly add a positive and a negative number', () => {
        expect(add(10, -5)).toBe(5);
    });

    it('should correctly add two negative numbers', () => {
        expect(add(-1, -5)).toBe(-6);
    });

    it('should correctly handle zero', () => {
        expect(add(100, 0)).toBe(100);
    });
});