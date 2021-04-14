import { OpenApiDocument } from '../index';
import { resolve } from 'path';
import { existsSync, mkdirSync, chmodSync, readFileSync } from 'fs';
import axios from 'axios';

export async function getSwaggerJson(pathOrUrl: string): Promise<OpenApiDocument> {
    let swaggerJson = {};
    if (pathOrUrl.indexOf('http') === 0) {
        swaggerJson = await axios.get(pathOrUrl).then(res => res.data);
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

export function makeDirIfNotExist(dir: string) {
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

export function setFullPermission(path: string) {
    try {
        chmodSync(path, 0o777);
    } catch (e) {
        console.error(`setFullPermission error path = ${path}`, e);
    }
}
