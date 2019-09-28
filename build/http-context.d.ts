/// <reference types="node" />
import accepts from 'accepts';
import { Context } from 'fts-core';
import http from 'http';
import url from 'url';
/**
 * Optional context utilities for FTS functions when invoked over http.
 *
 * Based off of [Koa](https://koajs.com/#context).
 *
 * TODO: port the rest of the jsdocs to this class.
 */
export declare class HttpContext extends Context {
    readonly req: http.IncomingMessage;
    readonly res: http.ServerResponse;
    readonly querystring: string;
    readonly query: any;
    protected pUrl?: url.URL;
    protected pAccept?: accepts.Accepts;
    constructor(req: http.IncomingMessage, res: http.ServerResponse);
    /** Request headers */
    readonly headers: http.IncomingHttpHeaders;
    /** Request URL */
    readonly url: string;
    /** Request origin URL */
    readonly origin: string;
    /** Full request URL */
    readonly href: string;
    readonly method: string;
    readonly path: string;
    readonly host: string;
    readonly hostname: string;
    readonly URL: url.URL;
    readonly socket: import("net").Socket;
    readonly charset: string;
    readonly contentType: string;
    readonly length: number | undefined;
    readonly protocol: "https" | "http";
    readonly secure: boolean;
    readonly ip: string;
    readonly accept: accepts.Accepts;
    accepts(...args: string[]): string | false | string[];
    acceptsEncodings(...args: string[]): string | false;
    acceptsCharsets(...args: string[]): string | false;
    acceptsLanguages(...args: string[]): string | false;
    is(t: string): string | false;
    readonly type: string;
    get(field: string): string;
    /**
     * Set header `field` to `val`.
     *
     * Examples:
     *
     *    this.set('Foo', ['bar', 'baz'])
     *    this.set('Accept', 'application/json')
     */
    set(field: string, val: string | string[]): void;
}
