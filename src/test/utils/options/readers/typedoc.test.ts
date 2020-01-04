import { join } from 'path';
import { deepStrictEqual as equal } from 'assert';

import { TypeDocReader } from '../../../../lib/utils/options/readers';
import { Logger, Options, ConsoleLogger } from '../../../../lib/utils';

describe('TypeDocReader', () => {
    const options = new Options(new Logger());
    options.addDefaultDeclarations();
    options.addReader(new TypeDocReader());

    function test(name: string, input: string, cb: () => void) {
        it(name, () => {
            options.reset();
            options.setValue('options', input).unwrap();
            options.read(new ConsoleLogger());
            cb();
        });
    }

    test('Converts src to inputFiles', join(__dirname, 'data/src.json'), () => {
        equal(options.getValue('inputFiles'), ['a']);
    });

    test('Preserves splitting behavior', join(__dirname, 'data/src2.json'), () => {
        equal(options.getValue('inputFiles'), ['a']);
    });

    it('Errors if the file cannot be found', () => {
        options.reset();
        options.setValue('options', join(__dirname, 'data/non-existent-file.json')).unwrap();
        let errored = false;
        options.read(new class extends Logger {
            error(msg: string) {
                equal(msg.includes('not be found'), true);
                errored = true;
            }
        });
        equal(errored, true, 'No error was logged');
    });

    it('Errors if the data is invalid', () => {
        options.reset();
        options.setValue('options', join(__dirname, 'data/invalid.json')).unwrap();
        let errored = false;
        options.read(new class extends Logger {
            error(msg: string) {
                equal(msg.includes('not an object'), true);
                errored = true;
            }
        });
        equal(errored, true, 'No error was logged');
    });

    it('Errors if any set option errors', () => {
        options.reset();
        options.setValue('options', join(__dirname, 'data/unknown.json')).unwrap();
        let errored = false;
        options.read(new class extends Logger {
            error(msg: string) {
                errored = true;
            }
        });
        equal(errored, true, 'No error was logged');
    });

    it('Does not error if the option file cannot be found but was not set.', () => {
        let errored = false;
        const options = new class LyingOptions extends Options {
            isDefault() {
                return true;
            }
        }(new Logger());

        options.addDefaultDeclarations();
        options.addReader(new TypeDocReader());
        options.read(new class extends Logger {
            error() {
                errored = true;
            }
        });
        equal(errored, false);
    });
});
