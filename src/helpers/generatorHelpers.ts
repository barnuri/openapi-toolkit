import { OpenApiDocument } from '../index';
import { resolve } from 'path';
import { existsSync, mkdirSync, chmodSync, readFileSync } from 'fs';
import axios from 'axios';
import * as https from 'https';
import { rimrafSync } from 'rimraf';

export async function getSwaggerJson(pathOrUrl: string): Promise<OpenApiDocument> {
    let swaggerJson = {};
    if (pathOrUrl.toLowerCase().startsWith('http')) {
        swaggerJson = await axios.get(pathOrUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(res => res.data);
    } else {
        swaggerJson = JSON.parse(readFileSync(pathOrUrl, 'utf8'));
    }
    return swaggerJson as OpenApiDocument;
}

export function fixPath(path: string): string {
    try {
        return resolve(path.replace(/\\/g, '/').replace(new RegExp('//'), '/'));
    } catch {
        return resolve(path);
    }
}

export function makeDirIfNotExist(dir: string): void {
    dir = fixPath(dir);
    try {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    } catch (e) {
        console.error(`makeDirIfNotExist error path = ${dir}`, e);
    }
    setFullPermission(dir);
}

export const deleteFilesByPath = (path: string) => {
    rimrafSync(path);
};

export function setFullPermission(path: string): void {
    try {
        chmodSync(path, 0o777);
    } catch (e) {
        console.error(`setFullPermission error path = ${path}`, e);
    }
}

export const isExists = (path: string) => {
    return existsSync(path);
}; 