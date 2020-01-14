import { DeclarationOption } from '../declaration';
import { Options } from '..';
import { BindOption } from '../options';

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
export function Option(option: DeclarationOption): PropertyDecorator {
    console.warn('The @Option decorator is deprecated and will be removed in v0.17.');
    console.warn(`  (Used to register ${option.name})`);
    declared.push(option);

    return BindOption(option.name) as any;
}
