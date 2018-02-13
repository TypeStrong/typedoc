import { DeclarationReflection } from '../../models/reflections/index';
import { ConverterComponent } from '../components';
export declare class TypePlugin extends ConverterComponent {
    reflections: DeclarationReflection[];
    initialize(): void;
    private onResolve(context, reflection);
    private postpone(reflection);
    private onResolveEnd(context);
}
