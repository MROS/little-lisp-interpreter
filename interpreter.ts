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
			case " ": {
				if (brace_count == 1) {
					exps.push(buf);
					buf = "";
				} else {
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

function evaluate(node: ExpNode) {
	if (node.exp.type == ExpType.Number) {
		return node.exp.value;
	} else if (node.exp.type == ExpType.Operator) {
		switch (node.exp.value) {
			case "+": {
				return evaluate(node.children[0]) + evaluate(node.children[1]);
			}
			case "-": {
				return evaluate(node.children[0]) - evaluate(node.children[1]);
			}
			case "*": {
				return evaluate(node.children[0]) * evaluate(node.children[1]);
			}
			case "/": {
				return evaluate(node.children[0]) / evaluate(node.children[1]);
			}
		}
	}
}

export function interpreter(program: string) {
	let root = parser(program);
	// show(root, 0);
	return evaluate(root);
}

// interpreter("(let ([a 3]) (+ a 2))");
// interpreter("(let ([a 3]) (let ([a yuja]) (+ a 2)))");