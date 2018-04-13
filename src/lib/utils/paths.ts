import * as Path from 'path';
import { isArray } from 'util';
import { Minimatch, IMinimatch } from 'minimatch';

function convertToMinimatch(pattern: string): IMinimatch {
    // Ensure uniform absolute path cross OS
    // (POSIX would resolve c:/path to /path/to/repo/c:/path without this check)
    if (Path.isAbsolute(pattern) && Path.sep === '/') {
        pattern = pattern.replace(/^\w:/, '');
    }

    if (pattern[0] !== '*') {
        // pattern path is resolved even if it is an absolute path,
        // to ensure correct format for the current OS
        pattern = Path.resolve(pattern);
    }

    // Unify the path slashes before creating the minimatch, for more relyable matching
    return new Minimatch(pattern.replace(/[\\]/g, '/'), { dot: true });
}

export function createMinimatch(pattern: string[]): IMinimatch[];
export function createMinimatch(pattern: string): IMinimatch;
export function createMinimatch(pattern: string | string[]): IMinimatch | IMinimatch[] {
    return isArray(pattern)
        ? pattern.map(convertToMinimatch)
        : convertToMinimatch(pattern);
}
