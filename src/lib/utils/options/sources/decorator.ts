import { DeclarationOption } from '../declaration';
import { Options } from '..';
import { Application } from '../../../application';

const declared: DeclarationOption[] = [];

export function addDecoratedOptions(options: Options) {
    options.addDeclarations(declared);
}

/**
 * Declares the given option and binds it to the decorated property without strict checks.
 *
 * @deprecated Options should be declared on the options object. Will be removed in 0.17.
 * @param option
 */
export function Option(option: DeclarationOption) {
    console.warn('The @Option decorator is deprecated and will be removed in v0.17.');
    console.warn(`  (Used to register ${option.name})`);
    declared.push(option);

    return function(target: { application: Application } | { options: Options }, key: PropertyKey) {
        Object.defineProperty(target, key, {
            get(this: { application: Application } | { options: Options }) {
                if ('options' in this) {
                    return this.options.getValue(name);
                } else {
                    return this.application.options.getValue(name);
                }
            },
            enumerable: true,
            configurable: true
        });
    };
}
