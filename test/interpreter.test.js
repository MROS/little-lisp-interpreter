var assert = require("assert");
var interpreter = require("../build/interpreter.js").interpreter;

describe("interpreter", function () {
	it("能夠進行四則運算", function () {
		assert.equal(interpreter("(+ 1 (+ 4 (- 0 -2))))"), 7);
		assert.equal(interpreter("(/ 18 (- 1 (* -2 4)))"), 2);
		assert.equal(interpreter("(* 1 (/ 4 (- 0 -2)))"), 2);
	});
})