"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const micro_1 = __importDefault(require("micro"));
const parse_endpoint_1 = require("./parse-endpoint");
/**
 * Small wrapper around [micro](https://github.com/zeit/micro) for creating
 * an http server that wraps for a single HttpHandler function.
 */
async function createHttpServer(handler, endpointOrPort, options = {}) {
    const opts = Object.assign({ silent: false, serve: micro_1.default }, options);
    const server = opts.serve(handler);
    const parsedEndpoint = parse_endpoint_1.parseEndpoint(endpointOrPort);
    const log = opts.silent ? noop : console.log.bind(console);
    return new Promise((resolve, reject) => {
        server.on('error', (err) => {
            log('fts:', err.stack);
            reject(err);
        });
        server.listen(...parsedEndpoint, () => {
            const details = server.address();
            registerShutdown(() => server.close());
            if (typeof details === 'string') {
                log(`fts: Accepting connections on ${details}`);
            }
            else if (typeof details === 'object' && details.port) {
                log(`fts: Accepting connections on port ${details.port}`);
            }
            else {
                log('fts: Accepting connections');
            }
            resolve(server);
        });
    });
}
exports.createHttpServer = createHttpServer;
function registerShutdown(cb) {
    let run = false;
    const wrapper = () => {
        if (!run) {
            run = true;
            cb();
        }
    };
    process.on('SIGINT', wrapper);
    process.on('SIGTERM', wrapper);
    process.on('exit', wrapper);
}
function noop() {
    return undefined;
}
//# sourceMappingURL=server.js.map