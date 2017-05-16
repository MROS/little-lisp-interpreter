enum ExpType {
	LET,
	Operator,
	Variable,
	Number,
	Binding,
	Let,
}

class Exp {
	type: ExpType;
	value: string | number;
	constructor(type: ExpType, value: string | number) {
		this.type = type;
		this.value = value;
	}
}

class ExpNode {
	children: ExpNode[];
	exp: Exp;
	constructor(exp: Exp, children: ExpNode[]) {
		this.exp = exp;
		this.children = children;
	}
}

// 試以正則表達式做更佳的分割
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

function parser(program: string): ExpNode {
	const exps = split_expression(program);
	// console.log(`program: ${program}, exps: ${exps}`);
	switch (true) {
		// let
		case /^let$/.test(exps[0]):
			return new ExpNode(new Exp(ExpType.LET, "let"), [parser(exps[1]), parser(exps[2])]);
		// 數字
		case /^-?[0-9]+$/.test(exps[0]):
			return new ExpNode(new Exp(ExpType.Number, Number(exps[0])), []);
		// 加減乘除
		case /^(\+|-|\*|\/)$/.test(exps[0]):
			return new ExpNode(
				new Exp(ExpType.Operator, exps[0]),
				exps.slice(1).map((str) => parser(str)));
		// 變數綁定
		case /^\[[a-z-]+ (.+)\]$/.test(exps[0]):
			let variable = /^\[([a-z-]+) (.+)\]$/.exec(exps[0])[1];
			let target = /^\[([a-z-]+) (.+)\]$/.exec(exps[0])[2];
			return new ExpNode(new Exp(ExpType.Binding, "binding"), [parser(variable), parser(target)]);
		// 變數
		case /^[a-z-]+/.test(exps[0]):
			return new ExpNode(new Exp(ExpType.Variable, exps[0]), []);
	}
}

function show(node, level) {
	console.log(`${' '.repeat(level * 4)}${node.exp.value}`);
	for (let c of node.children) {
		show(c, level + 1);
	}
}

// TODO: 需要處理同變數重複綁定
function eval_with_env(node: ExpNode, env: Map<string, ExpNode>) {
	switch (node.exp.type) {
		case ExpType.Number: {
			return node.exp.value;
		}
		case ExpType.Variable: {
			// 若node.exp.type 為 ExpType.Variable ，則 node.exp.value 在建構時必為字串，然而 TypeScript 的型態系統無法推導
			// 故強制轉型
			let variable = String(node.exp.value);
			if (env.has(variable)) {
				return eval_with_env(env.get(variable), env);
			}
			throw new Error("變數 ${variable} 未綁定到任何值");
		}
		case ExpType.LET: {
			let binding = node.children[0], exp = node.children[1];
			let variable = String(binding.children[0].exp.value);
			env.set(variable, binding.children[1]);
			let ret = eval_with_env(exp, env);
			env.delete(variable);
			return ret;
		}
		case ExpType.Operator: {
			switch (node.exp.value) {
				case "+": {
					return eval_with_env(node.children[0], env) + eval_with_env(node.children[1], env);
				}
				case "-": {
					return eval_with_env(node.children[0], env) - eval_with_env(node.children[1], env);
				}
				case "*": {
					return eval_with_env(node.children[0], env) * eval_with_env(node.children[1], env);
				}
				case "/": {
					return eval_with_env(node.children[0], env) / eval_with_env(node.children[1], env);
				}
			}
		}
	}
}

export function interpreter(program: string) {
	let root = parser(program);
	// show(root, 0);
	let value = eval_with_env(root, new Map<string, ExpNode>());
	// console.log(`${program} 的求值結果為 ${value}`);
	return value
}

interpreter("(let ([a (let ([b 1]) b)]) (+ 1 a))");
// interpreter("(let ([a 3]) (let ([yuja a]) (- yuja (+ a 2))))");