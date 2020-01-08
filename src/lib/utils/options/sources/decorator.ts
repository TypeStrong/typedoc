import { DeclarationOption, TypeDocOptionMap, KeyToDeclaration } from '../declaration';
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
export function Option<K extends keyof TypeDocOptionMap>(option: { name: K } & KeyToDeclaration<K>) {
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
            enumerable: true,
            configurable: true
        });
    };
}
