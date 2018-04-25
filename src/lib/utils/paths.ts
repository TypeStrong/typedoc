import * as Path from 'path';
import { Minimatch, IMinimatch } from 'minimatch';

const unix = Path.sep === '/';

export function createMinimatch(patterns: string[]): IMinimatch[] {
    return patterns.map((pattern: string): IMinimatch => {
        // Ensure correct pathing on unix, by transforming `\` to `/` and remvoing any `X:/` fromt he path
        if (unix) { pattern = pattern.replace(/[\\]/g, '/').replace(/^\w:/, ''); }

        // pattern paths not starting with '**' are resolved even if it is an
        // absolute path, to ensure correct format for the current OS
        if (pattern.substr(0, 2) !== '**') {
            pattern = Path.resolve(pattern);
        }

        // On Windows we transform `\` to `/` to unify the way paths are intepreted
        if (!unix) { pattern = pattern.replace(/[\\]/g, '/'); }

        // Unify the path slashes before creating the minimatch, for more relyable matching
        return new Minimatch(pattern, { dot: true });
    });
}
