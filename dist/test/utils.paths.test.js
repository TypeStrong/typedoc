"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const minimatch_1 = require("minimatch");
const isEqual = require("lodash/isEqual");
const Assert = require("assert");
const __1 = require("..");
const absolutePath = (path) => Path.resolve(path.replace(/^\w:/, '')).replace(/[\\]/g, '/');
describe('Paths', () => {
    describe('createMinimatch', () => {
        it('Converts an array of paths to an array of Minimatch expressions', () => {
            const mms = __1.createMinimatch(['/some/path/**', '**/another/path/**', './relative/**/path']);
            Assert(Array.isArray(mms), 'Didn\'t return an array');
            const allAreMm = mms.every((mm) => mm instanceof minimatch_1.Minimatch);
            Assert(allAreMm, 'Not all paths are coverted to Minimatch');
        });
        it('Minimatch can match absolute paths expressions', () => {
            const paths = ['/unix/absolute/**/path', '\\windows\\alternative\\absolute\\path', 'C:\\Windows\\absolute\\*\\path', '**/arbitrary/path/**'];
            const mms = __1.createMinimatch(paths);
            const patterns = mms.map(({ pattern }) => pattern);
            const comparePaths = [
                absolutePath('/unix/absolute/**/path'),
                absolutePath('/windows/alternative/absolute/path'),
                absolutePath('/Windows/absolute/*/path'),
                '**/arbitrary/path/**'
            ];
            Assert(isEqual(patterns, comparePaths), `Patterns have been altered:\nMMS: ${patterns}\nPaths: ${comparePaths}`);
            Assert(mms[0].match(absolutePath('/unix/absolute/some/sub/dir/path')), 'Din\'t match unix path');
            Assert(mms[1].match(absolutePath('/windows/alternative/absolute/path')), 'Din\'t match windows alternative path');
            Assert(mms[2].match(absolutePath('/Windows/absolute/test/path')), 'Din\'t match windows path');
            Assert(mms[3].match(absolutePath('/some/deep/arbitrary/path/leading/nowhere')), 'Din\'t match arbitrary path');
        });
        it('Minimatch can match relative to the project root', () => {
            const paths = ['./relative/**/path', '../parent/*/path', 'no/dot/relative/**/path/*', '*/subdir/**/path/*', '.dot/relative/**/path/*'];
            const absPaths = paths.map((path) => absolutePath(path));
            const mms = __1.createMinimatch(paths);
            const patterns = mms.map(({ pattern }) => pattern);
            Assert(isEqual(patterns, absPaths), `Project root have not been added to paths:\nMMS: ${patterns}\nPaths: ${absPaths}`);
            Assert(mms[0].match(Path.resolve('relative/some/sub/dir/path')), 'Din\'t match relative path');
            Assert(mms[1].match(Path.resolve('../parent/dir/path')), 'Din\'t match parent path');
            Assert(mms[2].match(Path.resolve('no/dot/relative/some/sub/dir/path/test')), 'Din\'t match no dot path');
            Assert(mms[3].match(Path.resolve('some/subdir/path/here')), 'Din\'t match single star path');
            Assert(mms[4].match(Path.resolve('.dot/relative/some/sub/dir/path/test')), 'Din\'t match dot path');
        });
        it('Minimatch matches dot files', () => {
            const mm = __1.createMinimatch(['/some/path/**'])[0];
            Assert(mm.match(absolutePath('/some/path/.dot/dir')), 'Didn\'t match .dot path');
            Assert(mm.match(absolutePath('/some/path/normal/dir')), 'Didn\'t match normal path');
        });
    });
});
//# sourceMappingURL=utils.paths.test.js.map