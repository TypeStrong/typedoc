import * as _ from "lodash";
import * as Util from "util";
import * as ts from "typescript";

import {Event} from "../events";
import {Component, AbstractComponent, ChildableComponent} from "../component";
import {Application} from "../../application";
import {OptionDeclaration, IOptionDeclaration, ParameterScope} from "./declaration";


export class OptionsComponent extends AbstractComponent<Options> { }


export enum OptionsReadMode {
    Prefetch,
    Fetch
}


export interface IOptionsReadResult {
    hasErrors:boolean;
    inputFiles:string[];
}


export class DiscoverEvent extends Event
{
    data:any;

    mode:OptionsReadMode;

    inputFiles:string[] = [];

    errors:string[] = [];

    static DISCOVER:string = 'optionsDiscover';


    /**
     * Add an input/source file.
     *
     * The input files will be used as source files for the compiler. All command line
     * arguments without parameter will be interpreted as being input files.
     *
     * @param fileName The path and filename of the input file.
     */
    addInputFile(fileName:string) {
        this.inputFiles.push(fileName);
    }


    addError(message:string, ...args:string[]) {
        this.errors.push(Util.format.apply(this, arguments));
    }
}


@Component({name:"options", internal:true, childClass:OptionsComponent})
export class Options extends ChildableComponent<Application, OptionsComponent>
{
    private declarations:{[name:string]:OptionDeclaration};

    private values:{[name:string]:any};

    private compilerOptions:ts.CompilerOptions;


    initialize() {
        this.declarations = {};
        this.values = {};
        this.compilerOptions = {
            target: ts.ScriptTarget.ES3,
            module: ts.ModuleKind.None
        };
    }


    read(data:any = {}, mode:OptionsReadMode = OptionsReadMode.Fetch):IOptionsReadResult {
        var event  = new DiscoverEvent(DiscoverEvent.DISCOVER);
        event.data = data;
        event.mode = mode;

        this.trigger(event);
        this.setValues(event.data, '', event.addError.bind(event));

        if (mode == OptionsReadMode.Fetch) {
            var logger = this.application.logger;
            for (var error of event.errors) {
                logger.error(error);
            }
        }

        return {
            hasErrors: event.errors.length > 0,
            inputFiles: event.inputFiles
        };
    }


    getValue(name:string):any {
        var declaration = this.getDeclaration(name);
        if (!declaration) {
            throw new Error(Util.format("Unknown option `%s`.", name));
        }

        if (declaration.scope == ParameterScope.TypeScript) {
            throw new Error("TypeScript options cannot be fetched using `getValue`, use `getCompilerOptions` instead.");
        }

        if (name in this.values) {
            return this.values[name];
        } else {
            return declaration.defaultValue;
        }
    }


    getRawValues():any {
        return _.clone(this.values);
    }


    getDeclaration(name:string):OptionDeclaration {
        name = name.toLowerCase();

        if (name in this.declarations) {
            return this.declarations[name];
        }
    }


    getDeclarationsByScope(scope:ParameterScope):OptionDeclaration[] {
        var result:OptionDeclaration[] = [];
        for (var name in this.declarations) {
            var declaration = this.declarations[name];
            if (declaration.scope == scope) {
                result.push(declaration);
            }
        }

        return _.uniq(result);
    }


    getCompilerOptions():ts.CompilerOptions {
        return this.compilerOptions;
    }


    setValue(name:string|OptionDeclaration, value:any, errorCallback?:Function) {
        var declaration = name instanceof OptionDeclaration ? name : this.getDeclaration(<string>name);
        if (!declaration) {
            if (errorCallback) {
                errorCallback('Unknown option `%s`.', name.toString());
            }
            return;
        }

        var key = declaration.name;
        if (declaration.scope == ParameterScope.TypeScript) {
            this.compilerOptions[key] = declaration.convert(value, errorCallback);
        } else {
            this.values[key] = declaration.convert(value, errorCallback);
        }
    }


    setValues(obj:Object, prefix:string = '', errorCallback?:Function) {
        for (var key in obj) {
            var value = obj[key];
            if (typeof value === 'object') {
                this.setValues(value, prefix + key + '.', errorCallback);
            } else {
                this.setValue(prefix + key, value, errorCallback);
            }
        }
    }


    addDeclaration(declaration:OptionDeclaration|IOptionDeclaration) {
        var decl:OptionDeclaration;
        if (!(declaration instanceof OptionDeclaration)) {
            decl = new OptionDeclaration(<IOptionDeclaration>declaration)
        } else {
            decl = <OptionDeclaration>declaration;
        }

        for (var name of decl.getNames()) {
            if (name in this.declarations) {
                this.application.logger.error('The option "%s" has already been registered by the "%s" component.', name, this.declarations[name].component);
            } else {
                this.declarations[name] = decl;
            }
        }
    }


    addDeclarations(declarations:(OptionDeclaration|IOptionDeclaration)[]) {
        for (var declaration of declarations) {
            this.addDeclaration(declaration);
        }
    }


    removeDeclaration(declaration:OptionDeclaration) {
        var names = _.keys(this.declarations);
        for (var name in names) {
            if (this.declarations[name] === declaration) {
                delete this.declarations[name];
            }
        }

        name = declaration.name;
        if (name in this.values) {
            delete this.values[name];
        }
    }


    removeDeclarationByName(name:string) {
        var declaration = this.getDeclaration(name);
        if (declaration) {
            this.removeDeclaration(declaration);
        }
    }
}
