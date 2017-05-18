const { Map } = require("immutable");

function split_expression(program: string): string[] {
	program = program.trim();
	let buf = "";
	let brace_count = 0;
	let exps = [];
	for (let c of program) {
		switch (c) {
			case "[":
			case "(": {
				if (brace_count > 0 ) { buf += c; }
				brace_count += 1;
				break;
			}
			case "]":
			case ")": {
				brace_count -= 1;
				if (brace_count > 0 ) { buf += c; }
				break;
			}
			case "\t":
			case "\n":
			case " ": {
				if (brace_count == 1 && buf != "") {
					exps.push(buf);
					buf = "";
				} else if (brace_count > 1) {
					buf += c;
				}
				break;
			}
			default: {
				buf += c;
			}
		}
	}
	exps.push(buf);
	return exps;
}

type ENV = Map<string, any>;

interface EXP {
	eval: (env: ENV) => any;
}

class Closure {
	env: ENV;
	variable: string;
	exp: EXP;
	constructor(env: ENV, variable: string, exp: EXP) {
		this.env = Map(env);
		this.variable = variable;
		this.exp = exp;
	}
}

class LET {
	variable: string;
	target: EXP;
	exp: EXP;
	constructor(program: string) {
		const exps = split_expression(program);
		const regex = /^\(\[([a-z-]+) (.+)\]\)$/
		if (regex.test(exps[1])) {
			this.variable = regex.exec(exps[1])[1];
			let target_str = regex.exec(exps[1])[2];
			this.target = parser(target_str);
		} else {
			throw new Error(`${exps[1]} 並非一個綁定`);
		}
		this.exp = parser(exps[2]);
	}
	eval(env: ENV) {
		const next_env = env.set(this.variable, this.target.eval(env));
		let ret = this.exp.eval(next_env);
		return ret;
	}
}

class Call {
	func: EXP;
	arg: EXP;
	constructor(program: string) {
		const exps = split_expression(program);
		this.func = parser(exps[0]);
		this.arg = parser(exps[1]);
	}
	eval(env: ENV) {
		let f = this.func.eval(env);
		let closure_env = f.env.set(f.variable, this.arg.eval(env));
		let ret = f.exp.eval(closure_env);
		return ret;
	}
}

class LAMBDA {
	variable: string;
	exp: EXP;
	constructor(program: string) {
		const exps = split_expression(program);
		if (/\(([a-z]+)\)/.test(exps[1])) {
			this.variable = /\(([a-z]+)\)/.exec(exps[1])[1];
		} else {
			throw new Error("lambda 後沒接變數");
		}
		this.exp = parser(exps[2]);
	}
	eval(env: ENV) {
		return new Closure(env, this.variable, this.exp);
	}
}

class Operation {
	operator: string;
	arg1: EXP;
	arg2: EXP;
	constructor(program: string) {
		const exps = split_expression(program);
		this.operator = exps[0];
		this.arg1 = parser(exps[1]);
		this.arg2 = parser(exps[2]);
	}
	eval(env: ENV) {
		switch (this.operator) {
			case "+": {
				return this.arg1.eval(env) + this.arg2.eval(env);
			}
			case "-": {
				return this.arg1.eval(env) - this.arg2.eval(env);
			}
			case "*": {
				return this.arg1.eval(env) * this.arg2.eval(env);
			}
			case "/": {
				return this.arg1.eval(env) / this.arg2.eval(env);
			}
		}
	}
}

class Variable {
	name: string;
	constructor(program: string) {
		this.name = program;
	}
	eval(env: ENV) {
		if (env.has(this.name)) {
			let exp = env.get(this.name);
			return exp;
		} else {
			throw new Error(`變數 ${this.name} 未綁定到任何值`);
		}
	}
}

class LispNumber {
	n: number;
	constructor(program: string) {
		this.n = Number(program);
	}
	eval(env: ENV) {
		return this.n;
	}
}

function parser(program: string): EXP {
	if (/\(.+\)/.test(program)) {
		const exps = split_expression(program);
		switch (true) {
			// lambda
			case /^lambda$/.test(exps[0]):
				return new LAMBDA(program);
			// let
			case /^let$/.test(exps[0]):
				return new LET(program);
			// 加減乘除
			case /^(\+|-|\*|\/)$/.test(exps[0]):
				return new Operation(program);
			case /^\(lambda .+\)/.test(exps[0]):
			case /^[a-z_]+/.test(exps[0]):
				return new Call(program);
				
		}
	} else { // 外面沒有括號的表達式，只該是變數或數字
		switch (true) {
			// 變數
			case /^[a-z_]+/.test(program):
				return new Variable(program);
			// 數字
			case /^-?[0-9]+$/.test(program):
				return new LispNumber(program);
		}
	}
}

export function interpreter(program: string) {
	let root = parser(program);
	let env: ENV = Map();
	// console.log(root);
	let value = root.eval(env);
	console.log(`${program} 的求值結果為 ${value}`);
	return value
}

interpreter("((lambda (a) (+ a 1)) 3)")
interpreter(`
(let ([f (lambda (a) (+ a 1))])
	(f 3))
`)
interpreter(`
(let ([x 2])
  (let ([f (lambda (y) (* x y))])
    (let ([x 4])
      (f 3))))
`)
// interpreter("(let ([a (let ([b 1]) b)]) (+ 1 a))");
// interpreter("(let ([a 3]) a)");
// interpreter("(let ([a 3]) (let ([yuja a]) (- 	yuja (+ a 2))))");