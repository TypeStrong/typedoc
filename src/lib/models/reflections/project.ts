import { SourceFile, SourceDirectory } from '../sources/index';
import { Reflection, ReflectionKind } from './abstract';
import { ContainerReflection } from './container';
import { DeclarationReflection } from './declaration';
import { splitUnquotedString } from './utils';

/**
 * A reflection that represents the root of the project.
 *
 * The project reflection acts as a global index, one may receive all reflections
 * and source files of the processed project through this reflection.
 */
export class ProjectReflection extends ContainerReflection {
    /**
     * A list of all reflections within the project.
     */
    reflections: {[id: number]: Reflection} = {};

    symbolMapping: {[symbolId: number]: number} = {};

    /**
     * The root directory of the project.
     */
    directory: SourceDirectory = new SourceDirectory();

    /**
     * A list of all source files within the project.
     */
    files: SourceFile[] = [];

    /**
     * The name of the project.
     *
     * The name can be passed as a command line argument or it is read from the package info.
     * this.name is assigned in the Reflection class.
     */
    name!: string;

    /**
     * The contents of the readme.md file of the project when found.
     */
    readme?: string;

    /**
     * The parsed data of the package.json file of the project when found.
     */
    packageInfo: any;

    /**
     * Create a new ProjectReflection instance.
     *
     * @param name  The name of the project.
     */
    constructor(name: string) {
        super(name, ReflectionKind.Global);
    }

    /**
     * Return whether this reflection is the root / project reflection.
     */
    isProject(): this is ProjectReflection {
        return true;
    }

    /**
     * Return a list of all reflections in this project of a certain kind.
     *
     * @param kind  The desired kind of reflection.
     * @returns     An array containing all reflections with the desired kind.
     */
    getReflectionsByKind(kind: ReflectionKind | ReflectionKind[]): Reflection[] {
        const values: Reflection[] = [];
        for (const id in this.reflections) {
            const reflection = this.reflections[id];
            if (reflection.kindOf(kind)) {
                values.push(reflection);
            }
        }

        return values;
    }

    /**
     * Prune from the descendants of this project the `DeclarationReflection` objects  that do not have the `Exported` flag set.
     * This modifies the tree in-place.
     */
    pruneNotExported(): void {
        const project = this;

        function _pruneNotExported(child) {
            if (!(child instanceof DeclarationReflection)) {
                return;
            }

            if (!child.flags.isExported) {
                delete project.reflections[child.id];

                const siblings = (<ContainerReflection> child.parent).children;
                if (siblings === undefined) {
                    throw new Error('internal error: the parent of a reflection has no children!');
                }
                const index = siblings.indexOf(child);
                siblings.splice(index, 1);
                return;
            }

            child.traverse(_pruneNotExported);
        }

        this.traverse(_pruneNotExported);
    }

    /**
     * @returns The list of rename declarations that point to a symbol for which we don't have a reflection.
     */
    getDanglingRenames(): string[] {
        const dangling = new Set<string>();
        const project = this;
        function _getDanglingRenames(child) {
            if (child instanceof DeclarationReflection && child.renames && !project.reflections[child.renames]) {
                dangling.add(child.name);
                delete child.renames;
            }

            child.traverse(_getDanglingRenames);
        }

        this.traverse(_getDanglingRenames);

        return Array.from(dangling);
    }

    /**
     * @param name  The name to look for. Might contain a hierarchy.
     */
    findReflectionByName(name: string): Reflection;

    /**
     * @param names  The name hierarchy to look for.
     */
    findReflectionByName(names: string[]): Reflection;

    /**
     * Try to find a reflection by its name.
     *
     * @param names The name hierarchy to look for, if a string, the name will be split on "."
     * @return The found reflection or undefined.
     */
    findReflectionByName(arg: string | string[]): Reflection | undefined {
        const names: string[] = Array.isArray(arg) ? arg : splitUnquotedString(arg, '.');
        const name = names.pop();

        search: for (const key in this.reflections) {
            const reflection = this.reflections[key];
            if (reflection.name !== name) {
                continue;
            }

            let depth = names.length - 1;
            let target: Reflection | undefined = reflection;
            while ((target = target.parent) && depth >= 0) {
                if (target.name !== names[depth]) {
                    continue search;
                }
                depth -= 1;
            }

            return reflection;
        }

        return undefined;
    }
}
