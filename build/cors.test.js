"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fts_1 = require("fts");
const get_port_1 = __importDefault(require("get-port"));
const globby_1 = __importDefault(require("globby"));
const got_1 = __importDefault(require("got"));
const path_1 = __importDefault(require("path"));
const pify_1 = __importDefault(require("pify"));
const tempy_1 = __importDefault(require("tempy"));
const HTTP = __importStar(require("."));
const fixtures = globby_1.default.sync('./fixtures/hello-world.ts');
for (const fixture of fixtures) {
    const { name } = path_1.default.parse(fixture);
    ava_1.default.serial(name, async (t) => {
        const outDir = tempy_1.default.directory();
        const definition = await fts_1.generateDefinition(fixture, {
            compilerOptions: {
                outDir
            },
            emit: true
        });
        t.truthy(definition);
        const jsFilePath = path_1.default.join(outDir, `${name}.js`);
        const handler = HTTP.createHttpHandler(definition, jsFilePath);
        t.is(typeof handler, 'function');
        const port = await get_port_1.default();
        const server = await HTTP.createHttpServer(handler, port);
        const url = `http://localhost:${port}`;
        const res = await got_1.default(url, { method: 'options' });
        t.truthy(res);
        t.is(res.statusCode, 200);
        t.is(res.body, 'ok\n');
        await pify_1.default(server.close.bind(server))();
        await fs_extra_1.default.remove(outDir);
    });
}
//# sourceMappingURL=cors.test.js.map