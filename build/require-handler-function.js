"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const resolve_1 = __importDefault(require("resolve"));
function requireHandlerFunction(definition, file) {
    let entry;
    if (typeof file === 'string') {
        let filePath = file;
        if (!path_1.default.isAbsolute(filePath)) {
            const basedir = path_1.default.dirname(module.parent.parent.parent.filename);
            filePath = resolve_1.default.sync(file, { basedir });
        }
        entry = require(filePath);
    }
    else {
        entry = file;
    }
    if (!entry) {
        throw new Error(`FTS definition error "${definition.title}"; empty JS module require in file "${file}."`);
    }
    if (definition.config.defaultExport) {
        if (typeof entry === 'object') {
            entry = entry.default;
        }
    }
    else {
        if (!definition.config.namedExport) {
            throw new Error(`FTS definition error "${definition.title}"; must have either a defaultExport or namedExport in file "${file}."`);
        }
        entry = entry[definition.config.namedExport];
        if (!entry) {
            throw new Error(`FTS definition error "${definition.title}"; JS export "${definition.config.namedExport}" doesn't exist in file "${file}".`);
        }
    }
    if (typeof entry !== 'function') {
        throw new Error(`FTS definition error "${definition.title}"; referenced JS export is not a function in file "${file}".`);
    }
    return entry;
}
exports.requireHandlerFunction = requireHandlerFunction;
//# sourceMappingURL=require-handler-function.js.map