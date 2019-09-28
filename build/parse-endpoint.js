"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const defaultPort = 3000;
const defaultHostname = 'localhost';
function parseEndpoint(endpointOrPort) {
    if (endpointOrPort === undefined) {
        return [defaultPort, defaultHostname];
    }
    else if (typeof endpointOrPort === 'number') {
        return [endpointOrPort, defaultHostname];
    }
    const endpoint = endpointOrPort;
    const url = new url_1.URL(endpoint);
    switch (url.protocol) {
        case 'pipe:': {
            // some special handling
            const cutStr = endpoint.replace(/^pipe:/, '');
            if (cutStr.slice(0, 4) !== '\\\\.\\') {
                throw new Error(`Invalid Windows named pipe endpoint: ${endpoint}`);
            }
            return [cutStr];
        }
        case 'unix:':
            if (!url.pathname) {
                throw new Error(`Invalid UNIX domain socket endpoint: ${endpoint}`);
            }
            return [url.pathname];
        case 'tcp:':
        case 'http:': {
            const port = url.port ? parseInt(url.port, 10) : defaultPort;
            return [port, url.hostname];
        }
        default:
            throw new Error(`Unknown endpoint scheme (protocol): ${url.protocol}`);
    }
}
exports.parseEndpoint = parseEndpoint;
//# sourceMappingURL=parse-endpoint.js.map