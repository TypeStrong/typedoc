import { Reflection } from '../../models';
import { ReflectionCategory } from '../../models/ReflectionCategory';
import { ConverterComponent } from '../components';
export declare class CategoryPlugin extends ConverterComponent {
    defaultCategory: string;
    categoryOrder: string[];
    categorizeByGroup: boolean;
    static defaultCategory: string;
    static WEIGHTS: string[];
    initialize(): void;
    private onBegin;
    private onResolve;
    private onEndResolve;
    private categorize;
    private groupCategorize;
    private lumpCategorize;
    static getReflectionCategories(reflections: Reflection[]): ReflectionCategory[];
    static getCategory(reflection: Reflection): string;
    static sortCatCallback(a: ReflectionCategory, b: ReflectionCategory): number;
}
