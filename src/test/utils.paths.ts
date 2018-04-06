import * as Path from 'path';
import { Minimatch, IMinimatch } from 'minimatch';

import isEqual = require('lodash/isEqual');
import Assert = require('assert');

import { pathToMinimatch } from '..';

// Used to ensure uniform path cross OS
const absolutePath = (path: string) => Path.resolve(path).replace(/[\\]/g, '/');

describe('Paths', () => {
  describe('pathToMinimatch', () => {
    it('Converts a path to a Minimatch expression', () => {
      const mm = pathToMinimatch('/some/path/**');
      Assert(mm instanceof Minimatch, 'Path not coverted to Minimatch');
    });

    it('Converts an array of paths to an array of Minimatch expressions', () => {
      const mms = <IMinimatch[]> pathToMinimatch(['/some/path/**', '**/another/path/**', './relative/**/path']);
      Assert(Array.isArray(mms), 'Didn\'t return an array');

      const allAreMm = mms.every((mm) => mm instanceof Minimatch);
      Assert(allAreMm, 'Not all paths are coverted to Minimatch');
    });

    it('Minimatch can match absolute paths expressions', () => {
      const paths = ['/unix/absolute/**/path', 'C:/Windows/absolute/*/path', '**/arbitrary/path/**'];
      const mms = (<IMinimatch[]> pathToMinimatch(paths));
      const patterns = mms.map(({ pattern }) => pattern);
      const comparePaths = [...paths];
      comparePaths[0] = absolutePath(comparePaths[0]);

      Assert(isEqual(patterns, comparePaths), `Patterns have been altered:\nMMS: ${patterns}\nPaths: ${comparePaths}`);

      Assert(mms[0].match(absolutePath('/unix/absolute/some/sub/dir/path')), 'Din\'t match unix path');
      Assert(mms[1].match('C:/Windows/absolute/test/path'), 'Din\'t match windows path');
      Assert(mms[2].match(absolutePath('/some/deep/arbitrary/path/leading/nowhere')), 'Din\'t match arbitrary path');
    });

    it('Minimatch can match relative to the project root', () => {
      const paths = ['./relative/**/path', '../parent/*/path', 'no/dot/relative/**/path/*', '.dot/relative/**/path/*'];
      const absPaths = paths.map((path) => Path.resolve(path).replace(/\\/g, '/'));
      const mms = (<IMinimatch[]> pathToMinimatch(paths));
      const patterns = mms.map(({ pattern }) => pattern);

      Assert(isEqual(patterns, absPaths), `Project root have not been added to paths:\nMMS: ${patterns}\nPaths: ${absPaths}`);

      Assert(mms[0].match(Path.resolve('relative/some/sub/dir/path')), 'Din\'t match relative path');
      Assert(mms[1].match(Path.resolve('../parent/dir/path')), 'Din\'t match parent path');
      Assert(mms[2].match(Path.resolve('no/dot/relative/some/sub/dir/path/test')), 'Din\'t match no dot path');
      Assert(mms[3].match(Path.resolve('.dot/relative/some/sub/dir/path/test')), 'Din\'t match dot path');
    });

    it('Minimatch matches dot files', () => {
      const mm = <IMinimatch> pathToMinimatch('/some/path/**');
      Assert(mm.match(absolutePath('/some/path/.dot/dir')), 'Didn\'t match .dot path');
      Assert(mm.match(absolutePath('/some/path/normal/dir')), 'Didn\'t match normal path');
    });
  });
});
