import { Definition } from 'fts';
import * as HTTP from './types';
export declare function createHttpHandler(definition: Definition, jsFilePathOrModule: string | object, options?: {
    cors: {
        allowMethods: string[];
    };
}): HTTP.HttpHandler;
