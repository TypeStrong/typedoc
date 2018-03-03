import { Reflection, ReflectionKind } from '../../models/reflections/index';
import { ReflectionGroup } from '../../models/ReflectionGroup';
import { ConverterComponent } from '../components';
export declare class GroupPlugin extends ConverterComponent {
    static WEIGHTS: ReflectionKind[];
    static SINGULARS: {};
    static PLURALS: {};
    initialize(): void;
    private onResolve(context, reflection);
    private onEndResolve(context);
    static getReflectionGroups(reflections: Reflection[]): ReflectionGroup[];
    private static getKindString(kind);
    static getKindSingular(kind: ReflectionKind): string;
    static getKindPlural(kind: ReflectionKind): string;
    static sortCallback(a: Reflection, b: Reflection): number;
}
