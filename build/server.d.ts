/// <reference types="node" />
import http from 'http';
import { HttpHandler, HttpServerOptions } from './types';
/**
 * Small wrapper around [micro](https://github.com/zeit/micro) for creating
 * an http server that wraps for a single HttpHandler function.
 */
export declare function createHttpServer(handler: HttpHandler, endpointOrPort?: string | number, options?: Partial<HttpServerOptions>): Promise<http.Server>;
