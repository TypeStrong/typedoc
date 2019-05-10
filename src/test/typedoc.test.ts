import { Application } from '..';
import * as Path from 'path';
import Assert = require('assert');
import './.dot';
import { Converter, Context } from '../lib/converter';

describe('TypeDoc', function() {
    let application: Application;

    describe('Application', function() {
        before('constructs', function() {
            application = new Application();
        });
        it('expands input directory', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(expanded.includes(Path.join(inputFiles, 'class.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('expands input files', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(expanded.includes(inputFiles));
        });
        it('honors the exclude argument even on a fixed directory list', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(!expanded.includes(Path.join(inputFiles, 'class.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('honors the exclude argument even on a fixed file list', function() {
            const inputFiles = Path.join(__dirname, 'converter', 'class', 'class.ts');
            application.options.setValue('exclude', '**/class.ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(!expanded.includes(inputFiles));
        });
        it('supports multiple excludes', function() {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', '**/+(class|access).ts');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(!expanded.includes(Path.join(inputFiles, 'class', 'class.ts')));
            Assert(!expanded.includes(Path.join(inputFiles, 'access', 'access.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('supports array of excludes', function() {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', [ '**/class.ts', '**/access.ts' ]);
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(!expanded.includes(Path.join(inputFiles, 'class', 'class.ts')));
            Assert(!expanded.includes(Path.join(inputFiles, 'access', 'access.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('supports excluding directories beginning with dots', function() {
            const inputFiles = __dirname;
            application.options.setValue('exclude', '**/+(.dot)/**');
            const expanded = application.expandInputFiles([inputFiles]);

            Assert(!expanded.includes(Path.join(inputFiles, '.dot', 'index.ts')));
            Assert(!expanded.includes(inputFiles));
        });
        it('Honors the exclude option even if a module is imported', () => {
            application.options.setValue('exclude', '**/b.ts', Assert.fail);
            application.options.setValue('module', 'commonjs', Assert.fail);

            function handler(context: Context) {
                Assert.deepStrictEqual(context.fileNames, [
                    Path.resolve(__dirname, 'module', 'a.ts').replace(/\\/g, '/')
                ]);
            }
            application.converter.once(Converter.EVENT_END, handler);
            application.convert([ Path.join(__dirname, 'module', 'a.ts')]);
        });

        it('supports directory excludes', function() {
            const inputFiles = Path.join(__dirname, 'converter');
            application.options.setValue('exclude', [ '**/access' ]);
            const expanded = application.expandInputFiles([inputFiles]);

            Assert.strictEqual(expanded.includes(Path.join(inputFiles, 'class', 'class.ts')), true);
            Assert.strictEqual(expanded.includes(Path.join(inputFiles, 'access', 'access.ts')), false);
            Assert.strictEqual(expanded.includes(inputFiles), false);
        });
    });
});
