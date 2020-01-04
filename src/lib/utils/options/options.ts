import * as _ from 'lodash';
import * as ts from 'typescript';

import { DeclarationOption, ParameterScope, convert, TypeDocOptions, KeyToDeclaration } from './declaration';
import { Logger } from '../loggers';
import { Result, Ok, Err } from '../result';
import { insertPrioritySorted } from '../array';
import { addTSOptions, addDecoratedOptions } from './sources';

export interface OptionsReader {
    /**
     * Readers will be processed according to their priority.
     * A higher priority indicates that the reader should be called *later* so that
     * it can override options set by lower priority readers.
     *
     * Note that to preserve expected behavior, the argv reader must have both the lowest
     * priority so that it may set the location of config files used by other readers and
     * the highest priority so that it can override settings from lower priority readers.
     */
    priority: number;

    /**
     * The name of this reader so that it may be removed by plugins without the plugin
     * accessing the instance performing the read. Multiple readers may have the same
     * name.
     */
    name: string;

    /**
     * Read options from the reader's source and place them in the options parameter.
     * Options without a declared name may be treated as if they were declared with type
     * [[ParameterType.Mixed]]. Options which have been declared must be converted to the
     * correct type. As an alternative to doing this conversion in the reader,
     * the reader may use [[Options.setValue]], which will correctly convert values.
     * @param options
     * @param compilerOptions
     * @param container the options container that provides declarations
     * @param logger
     */
    read(container: Options, logger: Logger): void;
}

export class Options {
    private _readers: OptionsReader[] = [];
    private _declarations = new Map<string, Readonly<DeclarationOption>>();
    private _values: Partial<TypeDocOptions> = {};
    private _compilerOptions: ts.CompilerOptions = {};
    private _logger: Logger;

    constructor(logger: Logger) {
        this._logger = logger;
    }

    addDefaultDeclarations() {
        addTSOptions(this);
        addDecoratedOptions(this);
    }

    reset() {
        for (const declaration of this._declarations.values()) {
            const bag = declaration.scope === ParameterScope.TypeScript
                ? this._compilerOptions
                : this._values;
            bag[declaration.name] = convert(declaration.defaultValue, declaration)
                .expect(`Failed to validate default value for ${declaration.name}`);
        }
    }

    addReader(reader: OptionsReader): void {
        insertPrioritySorted(this._readers, reader);
    }

    removeReaderByName(name: string): void {
        this._readers = this._readers.filter(reader => reader.name !== name);
    }

    addDeclaration<K extends keyof TypeDocOptions>(declaration: { name: K } & KeyToDeclaration<K>): void;
    addDeclaration(declaration: Readonly<DeclarationOption>): void;
    addDeclaration(declaration: Readonly<DeclarationOption>): void {
        const names = [declaration.name];
        if (declaration.short) {
            names.push(declaration.short);
        }

        for (const name of names) {
            if (this.getDeclaration(name)) {
                this._logger.error(`The option ${name} has already been registered`);
            } else {
                this._declarations.set(name.toLowerCase(), declaration);
            }
        }

        const bag = declaration.scope === ParameterScope.TypeScript ? this._compilerOptions : this._values;
        bag[declaration.name] = convert(declaration.defaultValue, declaration)
            .expect(`Failed to validate default value for ${declaration.name}`);
    }

    addDeclarations(declarations: readonly DeclarationOption[]): void {
        for (const decl of declarations) {
            this.addDeclaration(decl);
        }
    }

    removeDeclaration(declaration: DeclarationOption): void {
        this.removeDeclarationByName(declaration.name);
    }

    removeDeclarationByName(name: string): void {
        const declaration = this.getDeclaration(name);
        if (declaration) {
            this._declarations.delete(declaration.name);
            if (declaration.short) {
                this._declarations.delete(declaration.short);
            }
            delete this._values[declaration.name];
        }
    }

    getDeclaration(name: string): Readonly<DeclarationOption> | undefined {
        return this._declarations.get(name.toLowerCase());
    }

    getDeclarationsByScope(scope: ParameterScope) {
        return _.uniq(Array.from(this._declarations.values()))
            .filter(declaration => (declaration.scope ?? ParameterScope.TypeDoc) === scope);
    }

    read(logger: Logger) {
        for (const reader of this._readers) {
            reader.read(this, logger);
        }
    }

    getRawValues(): Partial<TypeDocOptions> {
        return _.cloneDeep(this._values);
    }

    isDefault(name: keyof TypeDocOptions): boolean;
    isDefault(name: string): boolean;
    isDefault(name: string): boolean {
        return this.getValue(name) === this.getDeclaration(name)?.defaultValue;
    }

    getValue<K extends keyof TypeDocOptions>(name: K): TypeDocOptions[K];
    getValue(name: string): unknown;
    getValue(name: string): unknown {
        return this.tryGetValue(name).match({
            ok: v => v,
            err(err) { throw err;  }
        });
    }

    tryGetValue<K extends keyof TypeDocOptions>(name: K): Result<TypeDocOptions[K], Error>;
    tryGetValue(name: string): Result<unknown, Error>;
    tryGetValue(name: string): Result<unknown, Error> {
        const declaration = this.getDeclaration(name);
        if (!declaration) {
            return Err(new Error(`Unknown option '${name}'`));
        }

        if (declaration.scope === ParameterScope.TypeScript) {
            return Err(new Error('TypeScript options must be fetched with getCompilerOptions.'));
        }

        return Ok(this._values[declaration.name]);
    }

    getCompilerOptions(): ts.CompilerOptions {
        return _.cloneDeep(this._compilerOptions);
    }

    setValue<K extends keyof TypeDocOptions>(name: K, value: TypeDocOptions[K]): Result<void, Error>;
    setValue(name: string, value: unknown): Result<void, Error>;
    setValue(name: string, value: unknown): Result<void, Error> {
        const declaration = this.getDeclaration(name);
        if (!declaration) {
            return Err(Error(`Tried to set an option (${name}) that was not declared.`));
        }

        return convert(value, declaration).match({
            ok: value => {
                const bag = declaration.scope === ParameterScope.TypeScript
                    ? this._compilerOptions
                    : this._values;
                bag[declaration.name] = value;
                return Ok(void 0);
            },
            err: err => Err(Error(err))
        });
    }

    setValues(obj: Partial<TypeDocOptions>): Result<void, Error[]> {
        const errors: Error[] = [];
        for (const [name, value] of Object.entries(obj)) {
            this.setValue(name, value).match({
                ok() {},
                err(error) {
                    errors.push(error);
                }
            });
        }
        return errors.length ? Err(errors) : Ok(void 0);
    }
}
