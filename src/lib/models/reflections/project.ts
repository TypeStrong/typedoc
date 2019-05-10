import { SourceFile, SourceDirectory } from '../sources/index';
import { Reflection, ReflectionKind } from './abstract';
import { ContainerReflection } from './container';

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
     * Try to find a reflection by its name.
     *
     * @param names The name hierarchy to look for, if a string, the name will be split on "."
     * @return The found reflection or undefined.
     */
    findReflectionByName(arg: string | string[]): Reflection | undefined {
        const names: string[] = Array.isArray(arg) ? arg : arg.split('.');
        const name = names.pop();

        search: for (let key in this.reflections) {
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
