import * as _ from 'lodash';
import * as Util from 'util';
import * as ts from 'typescript';

import { Event } from '../events';
import { Component, AbstractComponent, ChildableComponent } from '../component';
import { Application } from '../../application';
import { OptionDeclaration, DeclarationOption, ParameterScope } from './declaration';

/**
 * Child of the master Options component.  Options === configuration
 *
 * Serves one of two roles:
 *
 * - Aggregates and contributes configuration declarations declared by components or plugins
 * - Parses option values from various sources (config file, command-line args, etc)
 */
export class OptionsComponent extends AbstractComponent<Options> { }

export enum OptionsReadMode {
    Prefetch,
    Fetch
}

export interface OptionsReadResult {
    hasErrors: boolean;
    inputFiles: string[];
}

export class DiscoverEvent extends Event {
    readonly mode: OptionsReadMode;
    data: any;

    constructor(name: string, mode: OptionsReadMode) {
        super(name);
        this.mode = mode;
    }

    inputFiles: string[] = [];

    errors: string[] = [];

    static DISCOVER = 'optionsDiscover';

    /**
     * Add an input/source file.
     *
     * The input files will be used as source files for the compiler. All command line
     * arguments without parameter will be interpreted as being input files.
     *
     * @param fileName The path and filename of the input file.
     */
    addInputFile(fileName: string) {
        this.inputFiles.push(fileName);
    }

    addError(message: string, ...args: string[]) {
        this.errors.push(Util.format.apply(this, arguments));
    }
}

/**
 * Responsible for loading options via child components that read options
 * from various sources.
 */
@Component({name: 'options', internal: true, childClass: OptionsComponent})
export class Options extends ChildableComponent<Application, OptionsComponent> {
    private declarations!: {[name: string]: OptionDeclaration};

    private values!: {[name: string]: any};

    private compilerOptions!: ts.CompilerOptions;

    initialize() {
        this.declarations = {};
        this.values = {};
        this.compilerOptions = {
            target: ts.ScriptTarget.ES3,
            module: ts.ModuleKind.None
        };
    }

    read(data: any = {}, mode: OptionsReadMode = OptionsReadMode.Fetch): OptionsReadResult {
        const event  = new DiscoverEvent(DiscoverEvent.DISCOVER, mode);
        event.data = data;

        this.trigger(event);
        this.setValues(event.data, '', event.addError.bind(event));

        if (mode === OptionsReadMode.Fetch) {
            const logger = this.application.logger;
            for (let error of event.errors) {
                logger.error(error);
            }
        }

        return {
            hasErrors: event.errors.length > 0,
            inputFiles: event.inputFiles
        };
    }

    getValue(name: string): any {
        const declaration = this.getDeclaration(name);
        if (!declaration) {
            throw new Error(Util.format('Unknown option `%s`.', name));
        }

        if (declaration.scope === ParameterScope.TypeScript) {
            throw new Error('TypeScript options cannot be fetched using `getValue`, use `getCompilerOptions` instead.');
        }

        if (name in this.values) {
            return this.values[name];
        } else {
            return declaration.defaultValue;
        }
    }

    getRawValues(): any {
        return _.clone(this.values);
    }

    getDeclaration(name: string): OptionDeclaration | undefined {
        return this.declarations[name.toLowerCase()];
    }

    getDeclarationsByScope(scope: ParameterScope): OptionDeclaration[] {
        const result = _.values(this.declarations)
            .filter(declaration => declaration.scope === scope);
        return _.uniq(result);
    }

    getCompilerOptions(): ts.CompilerOptions {
        return this.compilerOptions;
    }

    setValue(name: string | OptionDeclaration, value: any, errorCallback?: (format: string, ...args: string[]) => void) {
        const declaration = name instanceof OptionDeclaration ? name : this.getDeclaration(name);
        if (!declaration) {
            return;
        }

        const key = declaration.name;
        if (declaration.scope === ParameterScope.TypeScript) {
            this.compilerOptions[key] = declaration.convert(value, errorCallback);
        } else {
            this.values[key] = declaration.convert(value, errorCallback);
        }
    }

    setValues(obj: Object, prefix: string = '', errorCallback?: (format: string, ...args: string[]) => void) {
        for (let key in obj) {
            const value = obj[key];
            const declaration = this.getDeclaration(key);
            const shouldValueBeAnObject = declaration && declaration['map'] === 'object';
            if (!Array.isArray(value) && typeof value === 'object' && !shouldValueBeAnObject) {
                this.setValues(value, prefix + key + '.', errorCallback);
            } else {
                this.setValue(prefix + key, value, errorCallback);
            }
        }
    }

    addDeclaration(declaration: OptionDeclaration|DeclarationOption) {
        const decl = declaration instanceof OptionDeclaration
            ? declaration
            : new OptionDeclaration(declaration);

        for (let name of decl.getNames()) {
            if (name in this.declarations) {
                this.application.logger.error('The option "%s" has already been registered by the "%s" component.',
                    name,
                    this.declarations[name].component || '__unknown');
            } else {
                this.declarations[name] = decl;
            }
        }
    }

    addDeclarations(declarations: (OptionDeclaration|DeclarationOption)[]) {
        for (let declaration of declarations) {
            this.addDeclaration(declaration);
        }
    }

    removeDeclaration(declaration: OptionDeclaration) {
        const names = _.keys(this.declarations);
        for (const name of names) {
            if (this.declarations[name] === declaration) {
                delete this.declarations[name];
            }
        }

        if (declaration.name in this.values) {
            delete this.values[declaration.name];
        }
    }

    removeDeclarationByName(name: string) {
        const declaration = this.getDeclaration(name);
        if (declaration) {
            this.removeDeclaration(declaration);
        }
    }
}
