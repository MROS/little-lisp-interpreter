enum ExpType {
	Operator,
	Number
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
	constructor(children: ExpNode[], exp: Exp) {
		this.children = children;
		this.exp = exp;
	}
}

function parse(program: string): ExpNode {
	let buf = "";
	let brace_count = 0;
	let exps = [];
	for (let c of program) {
		switch (c) {
			case "(": {
				if (brace_count > 0 ) { buf += c; }
				brace_count += 1;
				break;
			}
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
	let node: ExpNode;
	if (exps.length == 1) {
		node = new ExpNode([], new Exp(ExpType.Number, Number(exps[0])));
	} else {
		node = new ExpNode([], new Exp(ExpType.Operator, exps[0]));
		for (let i = 1; i < exps.length; i++) {
			node.children.push(parse(exps[i]));
		}
	}
	return node;
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
				// return node.children.reduce((acc, val) => evaluate(acc) + evaluate(val), new ExpNode([], new Exp(ExpType.Number, 0)));
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
	let root = parse(program);
	return evaluate(root);
}

// const program = "(+ (- 1 2) (- 3 (+ 4 5)))";
// interpreter(program);