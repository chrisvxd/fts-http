"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accepts_1 = __importDefault(require("accepts"));
const content_type_1 = __importDefault(require("content-type"));
const fts_core_1 = require("fts-core");
const parseurl_1 = __importDefault(require("parseurl"));
const qs_1 = __importDefault(require("qs"));
const type_is_1 = __importDefault(require("type-is"));
const url_1 = __importDefault(require("url"));
/**
 * Optional context utilities for FTS functions when invoked over http.
 *
 * Based off of [Koa](https://koajs.com/#context).
 *
 * TODO: port the rest of the jsdocs to this class.
 */
class HttpContext extends fts_core_1.Context {
    constructor(req, res) {
        super(fts_core_1.version);
        this.req = req;
        this.res = res;
        const urlinfo = url_1.default.parse(req.url);
        this.querystring = urlinfo.query || '';
        this.query = qs_1.default.parse(this.querystring);
    }
    /** Request headers */
    get headers() {
        return this.req.headers;
    }
    /** Request URL */
    get url() {
        return this.req.url;
    }
    /** Request origin URL */
    get origin() {
        return `${this.protocol}://${this.host}`;
    }
    /** Full request URL */
    get href() {
        // support: `GET http://example.com/foo`
        if (/^https?:\/\//i.test(this.url)) {
            return this.url;
        }
        return this.origin + this.url;
    }
    get method() {
        return this.req.method;
    }
    get path() {
        return parseurl_1.default(this.req).pathname;
    }
    get host() {
        let host;
        if (this.req.httpVersionMajor >= 2) {
            host = this.get(':authority');
        }
        if (!host) {
            host = this.get('Host');
        }
        if (!host) {
            return '';
        }
        return host.split(/\s*,\s*/, 1)[0];
    }
    get hostname() {
        const host = this.host;
        if (!host) {
            return '';
        }
        if ('[' === host[0]) {
            return this.URL.hostname || '';
        } // IPv6
        return host.split(':', 1)[0];
    }
    get URL() {
        if (!this.pUrl) {
            try {
                this.pUrl = new URL(`${this.protocol}://${this.host}${this.url}`);
            }
            catch (err) {
                this.pUrl = Object.create(null);
            }
        }
        return this.pUrl;
    }
    get socket() {
        return this.req.socket;
    }
    get charset() {
        try {
            const { parameters } = content_type_1.default.parse(this.req);
            return parameters.charset || '';
        }
        catch (e) {
            return '';
        }
    }
    get contentType() {
        try {
            const { type } = content_type_1.default.parse(this.req);
            return type;
        }
        catch (e) {
            return '';
        }
    }
    get length() {
        const len = this.get('Content-Length');
        if (len !== '') {
            return parseInt(len, 10);
        }
        else {
            return undefined;
        }
    }
    get protocol() {
        /* tslint:disable */
        // TODO: this is hacky
        if (this.socket['secure']) {
            return 'https';
        }
        /* tslint:enable */
        return 'http';
    }
    get secure() {
        return 'https' === this.protocol;
    }
    get ip() {
        return this.socket.remoteAddress;
    }
    get accept() {
        if (!this.pAccept) {
            this.pAccept = accepts_1.default(this.req);
        }
        return this.pAccept;
    }
    accepts(...args) {
        return this.accept.types(...args);
    }
    acceptsEncodings(...args) {
        return this.accept.encodings(...args);
    }
    acceptsCharsets(...args) {
        return this.accept.charsets(...args);
    }
    acceptsLanguages(...args) {
        return this.accept.languages(...args);
    }
    is(t) {
        return type_is_1.default(this.req, [t]);
    }
    get type() {
        const type = this.get('Content-Type');
        if (!type) {
            return '';
        }
        return type.split(';')[0];
    }
    get(field) {
        const req = this.req;
        const header = field.toLowerCase();
        switch (header) {
            case 'referer':
            case 'referrer':
                return (req.headers.referrer ||
                    req.headers.referer ||
                    '');
            default:
                return req.headers[header] || '';
        }
    }
    /**
     * Set header `field` to `val`.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz'])
     *    this.set('Accept', 'application/json')
     */
    set(field, val) {
        if (Array.isArray(val)) {
            val = val.map((v) => (typeof v === 'string' ? v : String(v)));
        }
        else if (typeof val !== 'string') {
            val = String(val);
        }
        this.res.setHeader(field, val);
    }
}
exports.HttpContext = HttpContext;
//# sourceMappingURL=http-context.js.map