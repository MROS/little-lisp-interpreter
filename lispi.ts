const fs = require("fs");
import { interpreter } from "./interpreter";

let input_file = process.argv[2];
if (input_file == undefined) {
	console.error("錯誤：沒有輸入檔案");
	process.exit();
}

try {
	let program = fs.readFileSync(input_file, "utf8");
	console.log(interpreter(program));
} catch (error) {
	console.log(error.message);
	process.exit();
}