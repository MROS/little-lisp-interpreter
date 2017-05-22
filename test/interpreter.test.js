var assert = require("assert");
var evaluater = require("../build/interpreter.js").evaluater;
var interpreter = require("../build/interpreter.js").interpreter;

describe("evaluater", function () {
	describe("能夠進行四則運算", function () {
		it("(+ 1 (+ 4 (- 0 -2)))) = 7", function () {
			assert.equal(evaluater("(+ 1 (+ 4 (- 0 -2))))"), 7);
		});
		it("(/ 18 (- 1 (* -2 4))) = 2", function () {
			assert.equal(evaluater("(/ 18 (- 1 (* -2 4)))"), 2);
		});
		it("(* 1 (/ 4 (- 0 -2))) = 2", function () {
			assert.equal(evaluater("(* 1 (/ 4 (- 0 -2)))"), 2);
		});
	});
	describe("可接受換行、 tab", function () {
		const program =`
(+ 1
	(+ 4
		(- 0 -2))))
`
		it(`${program} = 7`, function () {
			assert.equal(evaluater(`${program}`), 7);
		});
	});
	describe("let 綁定生效", function () {
		it("(let ([a 3]) (+ a -2)) = 1", function () {
			assert.equal(evaluater("(let ([a 3]) (+ a -2))"), 1);
		})
		it("(let ([a 3]) (let ([b a]) (- b (+ a 2)))) = -2", function () {
			const program = `(let ([a 3]) (let ([b a]) (- b (+ a 2)))) `;
			assert.equal(evaluater(program), -2);
		});
		it("(let ([a (let ([b 1]) b)]) (+ 1 a)) = 2", function () {
			const program = `(let ([a (let ([b 1]) b)]) (+ 1 a)) `;
			assert.equal(evaluater(program), 2);
		});
	});
	describe("lambda 可用", function () {
		it("((lambda (a) (+ a 1)) 3) = 4", function () {
			assert.equal(evaluater("((lambda (a) (+ a 1)) 3)"), 4);
			
		})
	});
	describe("lambda 可被綁定為變數", function () {
		const program = `
(let ([f (lambda (a) (+ a 1))])
	(f 3))
`
		it(`${program} = 4`, function () {
			assert.equal(evaluater(`${program}`), 4);
		})
	});
	describe("詞法作用域", function () {
		const program = `
(let ([x 2])
  (let ([f (lambda (y) (* x y))])
    (let ([x 4])
      (f 3))))
`
		it(`${program} = 6`, function () {
			assert.equal(evaluater(`${program}`), 6);
		})
	});

	describe("if 生效", function () {
		it(`(if #t 1 2) = 1`, function () {
			assert.equal(evaluater("(if #t 1 2)"), 1);
		})
		it(`(if #f 1 2) = 2`, function () {
			assert.equal(evaluater("(if #f 1 2)"), 2);
		})
		it(`((lambda (x) (if (= x 1) 1 2)) 3) = 2`, function () {
			assert.equal(evaluater("((lambda (x) (if (= x 1) 1 2)) 3)"), 2);
		})
	});

	describe("lambda 實現遞迴", function () {
const fact = `
(((lambda (x) (x x))
 (lambda (fact)
   (lambda (n)
     (if (= n 0)
         1
         (* n ((fact fact) (- n 1))))))) 5)
`;
		it(`${fact} = 120`, function () {
			assert.equal(evaluater(`${fact}`), 120);
		})
	})
})

describe("interpreter", function () {
	describe("切割成各表達示後求值", function () {
		it(`(+ 1 2) ((lambda (x) (if (= x 1) 1 2)) 0) = [3, 2]`, function () {
			assert.deepEqual(interpreter("(+ 1 2) ((lambda (x) (if (= x 1) 1 2)) 0)"), [3, 2]);
		})
	})
})