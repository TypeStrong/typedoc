import { SourceFile, SourceDirectory } from '../sources/index';
import { Reflection, ReflectionKind } from './abstract';
import { ContainerReflection } from './container';
import { ReflectionCategory } from '../ReflectionCategory';

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
     * All reflections categorized.
     */
    categories: ReflectionCategory[];

    /**
     * The name of the project.
     *
     * The name can be passed as a commandline argument or it is read from the package info.
     */
    name: string;

    /**
     * The contents of the readme.md file of the project when found.
     */
    readme: string;

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
        super(null, name, ReflectionKind.Global);
    }

    /**
     * Return whether this reflection is the root / project reflection.
     */
    isProject(): boolean {
        return true;
    }

    /**
     * Return a list of all reflections in this project of a certain kind.
     *
     * @param kind  The desired kind of reflection.
     * @returns     An array containing all reflections with the desired kind.
     */
    getReflectionsByKind(kind: ReflectionKind): Reflection[] {
        const values: Reflection[] = [];
        for (let id in this.reflections) {
            const reflection = this.reflections[id];
            if (reflection.kindOf(kind)) {
                values.push(reflection);
            }
        }

        return values;
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
     * @return The found reflection or null.
     */
    findReflectionByName(arg: any): Reflection {
        const names: string[] = Array.isArray(arg) ? arg : arg.split('.');
        const name = names.pop();

        search: for (let key in this.reflections) {
            const reflection = this.reflections[key];
            if (reflection.name !== name) {
                continue;
            }

            let depth = names.length - 1;
            let target = reflection;
            while (target && depth >= 0) {
                target = target.parent;
                if (target.name !== names[depth]) {
                    continue search;
                }
                depth -= 1;
            }

            return reflection;
        }

        return null;
    }

    /**
     * Return a raw object representation of this reflection.
     * @deprecated Use serializers instead
     */
    toObject(): any {
        const result = super.toObject();

        if (this.categories) {
            const categories: any[] = [];
            this.categories.forEach((category) => {
                categories.push(category.toObject());
            });

            if (categories.length > 0) {
                result['categories'] = categories;
            }
        }

        return result;
    }
}
