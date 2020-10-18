import * as ts from "typescript";
import * as _ts from "../ts-internal";
import * as _ from "lodash";

import { Application } from "../application";
import { Reflection, Type, ProjectReflection } from "../models/index";
import { Context } from "./context";
import {
    ConverterComponent,
    ConverterNodeComponent,
    ConverterTypeComponent,
    TypeTypeConverter,
    TypeNodeConverter,
} from "./components";
import {
    Component,
    ChildableComponent,
    ComponentClass,
} from "../utils/component";
import { BindOption, removeIfPresent } from "../utils";
import { convertType } from "./types";

/**
 * Compiles source files using TypeScript and converts compiler symbols to reflections.
 */
@Component({
    name: "converter",
    internal: true,
    childClass: ConverterComponent,
})
export class Converter extends ChildableComponent<
    Application,
    ConverterComponent
> {
    /**
     * The human readable name of the project. Used within the templates to set the title of the document.
     */
    @BindOption("name")
    name!: string;

    @BindOption("externalPattern")
    externalPattern!: Array<string>;

    @BindOption("includeDeclarations")
    includeDeclarations!: boolean;

    @BindOption("excludeExternals")
    excludeExternals!: boolean;

    @BindOption("excludeNotDocumented")
    excludeNotDocumented!: boolean;

    @BindOption("excludePrivate")
    excludePrivate!: boolean;

    @BindOption("excludeProtected")
    excludeProtected!: boolean;

    /**
     * Defined in the initialize method
     */
    private nodeConverters!: {
        [syntaxKind: string]: ConverterNodeComponent<ts.Node>;
    };

    /**
     * Defined in the initialize method
     */
    private typeNodeConverters!: TypeNodeConverter<ts.Type, ts.Node>[];

    /**
     * Defined in the initialize method
     */
    private typeTypeConverters!: TypeTypeConverter<ts.Type>[];

    /**
     * General events
     */

    /**
     * Triggered when the converter begins converting a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static EVENT_BEGIN = "begin";

    /**
     * Triggered when the converter has finished converting a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static EVENT_END = "end";

    /**
     * Factory events
     */

    /**
     * Triggered when the converter begins converting a source file.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_FILE_BEGIN = "fileBegin";

    /**
     * Triggered when the converter has created a declaration reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_CREATE_DECLARATION = "createDeclaration";

    /**
     * Triggered when the converter has created a signature reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_CREATE_SIGNATURE = "createSignature";

    /**
     * Triggered when the converter has created a parameter reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_CREATE_PARAMETER = "createParameter";

    /**
     * Triggered when the converter has created a type parameter reflection.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_CREATE_TYPE_PARAMETER = "createTypeParameter";

    /**
     * Triggered when the converter has found a function implementation.
     * The listener should implement [[IConverterNodeCallback]].
     * @event
     */
    static EVENT_FUNCTION_IMPLEMENTATION = "functionImplementation";

    /**
     * Resolve events
     */

    /**
     * Triggered when the converter begins resolving a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static EVENT_RESOLVE_BEGIN = "resolveBegin";

    /**
     * Triggered when the converter resolves a reflection.
     * The listener should implement [[IConverterResolveCallback]].
     * @event
     */
    static EVENT_RESOLVE = "resolveReflection";

    /**
     * Triggered when the converter has finished resolving a project.
     * The listener should implement [[IConverterCallback]].
     * @event
     */
    static EVENT_RESOLVE_END = "resolveEnd";

    /**
     * Create a new Converter instance.
     *
     * @param application  The application instance this converter relies on. The application
     *   must expose the settings that should be used and serves as a global logging endpoint.
     */
    initialize() {
        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    }

    addComponent<T extends ConverterComponent & Component>(
        name: string,
        componentClass: T | ComponentClass<T>
    ): T {
        const component = super.addComponent(name, componentClass);
        if (component instanceof ConverterNodeComponent) {
            this.addNodeConverter(component);
        } else if (component instanceof ConverterTypeComponent) {
            this.addTypeConverter(component);
        }

        return component;
    }

    private addNodeConverter(converter: ConverterNodeComponent<any>) {
        for (const supports of converter.supports) {
            this.nodeConverters[supports] = converter;
        }
    }

    private addTypeConverter(converter: ConverterTypeComponent) {
        if ("supportsNode" in converter && "convertNode" in converter) {
            this.typeNodeConverters.push(
                <TypeNodeConverter<any, any>>converter
            );
            this.typeNodeConverters.sort((a, b) => b.priority - a.priority);
        }

        if ("supportsType" in converter && "convertType" in converter) {
            this.typeTypeConverters.push(<TypeTypeConverter<any>>converter);
            this.typeTypeConverters.sort((a, b) => b.priority - a.priority);
        }
    }

    removeComponent(name: string): ConverterComponent | undefined {
        const component = super.removeComponent(name);
        if (component instanceof ConverterNodeComponent) {
            this.removeNodeConverter(component);
        } else if (component instanceof ConverterTypeComponent) {
            this.removeTypeConverter(component);
        }

        return component;
    }

    private removeNodeConverter(converter: ConverterNodeComponent<any>) {
        const converters = this.nodeConverters;
        const keys = _.keys(this.nodeConverters);
        for (const key of keys) {
            if (converters[key] === converter) {
                delete converters[key];
            }
        }
    }

    private removeTypeConverter(converter: ConverterTypeComponent) {
        removeIfPresent(this.typeTypeConverters, converter);
        removeIfPresent(this.typeNodeConverters, converter);
    }

    removeAllComponents() {
        super.removeAllComponents();

        this.nodeConverters = {};
        this.typeTypeConverters = [];
        this.typeNodeConverters = [];
    }

    /**
     * Compile the given source files and create a project reflection for them.
     *
     * @param fileNames  Array of the file names that should be compiled.
     */
    convert(): ProjectReflection | readonly ts.Diagnostic[] {
        const program = ts.createProgram(
            this.application.options.getFileNames(),
            this.application.options.getCompilerOptions()
        );
        const checker = program.getTypeChecker();
        const context = new Context(
            this,
            program.getRootFileNames(),
            checker,
            program
        );

        this.trigger(Converter.EVENT_BEGIN, context);

        const errors = this.compile(context);
        if (errors.length) {
            return errors;
        }

        const project = this.resolve(context);
        project.removeDanglingReferences();

        this.trigger(Converter.EVENT_END, context);

        return project;
    }

    /**
     * Analyze the given node and create a suitable reflection.
     *
     * This function checks the kind of the node and delegates to the matching function implementation.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The compiler node that should be analyzed.
     * @return The resulting reflection or undefined.
     */
    convertNode(context: Context, node: ts.Node): Reflection | undefined {
        if (context.visitStack.includes(node)) {
            return;
        }

        const oldVisitStack = context.visitStack.slice();
        context.visitStack.push(node);

        let result: Reflection | undefined;
        if (node.kind in this.nodeConverters) {
            result = this.nodeConverters[node.kind].convert(context, node);
        } else {
            this.application.logger.warn(
                `Missing converter for node having kind ${
                    ts.SyntaxKind[node.kind]
                }`
            );
        }

        context.visitStack = oldVisitStack;
        return result;
    }

    /**
     * Convert the given TypeScript type into its TypeDoc type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The node whose type should be reflected.
     * @param type  The type of the node if already known.
     * @returns The TypeDoc type reflection representing the given node and type.
     */
    convertType(
        context: Context,
        node: ts.TypeNode | ts.Type | undefined
    ): Type {
        return convertType(context, node);
    }

    /**
     * Helper function to convert multiple types at once, filtering out types which fail to convert.
     *
     * @param context
     * @param nodes
     */
    convertTypes(
        context: Context,
        nodes: ReadonlyArray<ts.TypeNode> = [],
        types: ReadonlyArray<ts.Type> = []
    ): Type[] {
        const result: Type[] = [];
        _.zip(nodes, types).forEach(([node, type]) => {
            const converted = this.convertType(context, node ?? type!);
            if (converted) {
                result.push(converted);
            }
        });
        return result;
    }

    /**
     * Compile the files within the given context and convert the compiler symbols to reflections.
     *
     * @param context  The context object describing the current state the converter is in.
     * @returns An array containing all errors generated by the TypeScript compiler.
     */
    private compile(context: Context): ReadonlyArray<ts.Diagnostic> {
        const errors = ts.getPreEmitDiagnostics(context.program);
        if (errors.length) {
            return errors;
        }

        const needsSecondPass: ts.SourceFile[] = [];
        context.inFirstPass = true;
        for (const entry of this.application.entryPoints) {
            if (entry.endsWith(".json")) continue;
            const sourceFile = context.program.getSourceFile(
                entry.replace(/\\/g, "/")
            );
            if (!sourceFile) {
                this.application.logger.warn(
                    `Unable to locate entry point: ${entry}`
                );
                continue;
            }

            needsSecondPass.push(sourceFile);
            this.convertNode(context, sourceFile);
        }

        context.inFirstPass = false;
        for (const file of needsSecondPass) {
            this.convertNode(context, file);
        }

        return [];
    }

    /**
     * Resolve the project within the given context.
     *
     * @param context  The context object describing the current state the converter is in.
     * @returns The final project reflection.
     */
    private resolve(context: Context): ProjectReflection {
        this.trigger(Converter.EVENT_RESOLVE_BEGIN, context);
        const project = context.project;

        for (const reflection of Object.values(project.reflections)) {
            this.trigger(Converter.EVENT_RESOLVE, context, reflection);
        }

        this.trigger(Converter.EVENT_RESOLVE_END, context);
        return project;
    }

    /**
     * Return the basename of the default library that should be used.
     *
     * @returns The basename of the default library.
     */
    getDefaultLib(): string {
        return ts.getDefaultLibFileName(
            this.application.options.getCompilerOptions()
        );
    }
}
