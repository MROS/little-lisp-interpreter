var assert = require("assert");
var interpreter = require("../build/interpreter.js").interpreter;

describe("interpreter", function () {
	describe("能夠進行四則運算", function () {
		it("(+ 1 (+ 4 (- 0 -2)))) = 7", function () {
			assert.equal(interpreter("(+ 1 (+ 4 (- 0 -2))))"), 7);
		});
		it("(/ 18 (- 1 (* -2 4))) = 2", function () {
			assert.equal(interpreter("(/ 18 (- 1 (* -2 4)))"), 2);
		});
		it("(* 1 (/ 4 (- 0 -2))) = 2", function () {
			assert.equal(interpreter("(* 1 (/ 4 (- 0 -2)))"), 2);
		});
	});
	describe("可接受換行、 tab", function () {
		const program =`
(+ 1
	(+ 4
		(- 0 -2))))
`
		it(`${program} = 7`, function () {
			assert.equal(interpreter(`${program}`), 7);
		});
	});
	describe("let 綁定生效", function () {
		it("(let ([a 3]) (+ a -2)) = 1", function () {
			assert.equal(interpreter("(let ([a 3]) (+ a -2))"), 1);
		})
		it("(let ([a 3]) (let ([b a]) (- b (+ a 2)))) = -2", function () {
			const program = `(let ([a 3]) (let ([b a]) (- b (+ a 2)))) `;
			assert.equal(interpreter(program), -2);
		});
		it("(let ([a (let ([b 1]) b)]) (+ 1 a)) = 2", function () {
			const program = `(let ([a (let ([b 1]) b)]) (+ 1 a)) `;
			assert.equal(interpreter(program), 2);
		});
	});
})