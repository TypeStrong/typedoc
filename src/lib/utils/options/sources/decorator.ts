import { DeclarationOption } from '../declaration';
import { Options } from '..';
import { Application } from '../../../application';

const declared: DeclarationOption[] = [];

export function addDecoratedOptions(options: Options) {
    options.addDeclarations(declared);
}

/**
 * Declares the given option and binds it to the decorated property.
 * @param option
 */
export function Option(option: DeclarationOption) {
    declared.push(option);

    return function(target: { application: Application } | { options: Options }, key: PropertyKey) {
        Object.defineProperty(target, key, {
            get(this: { application: Application } | { options: Options }) {
                if ('options' in this) {
                    return this.options.getValue(option.name);
                } else {
                    return this.application.options.getValue(option.name);
                }
            },
            set(this: { application: Application } | { options: Options }, value: unknown) {
                if ('options' in this) {
                    this.options.setValue(option.name, value).unwrap();
                } else {
                    this.application.options.setValue(option.name, value).unwrap();
                }
            },
            enumerable: true,
            configurable: true
        });
    };
}
