import { DeclarationReflection } from '../../models/reflections/index';
import { ConverterComponent } from '../components';
export declare class TypePlugin extends ConverterComponent {
    reflections: DeclarationReflection[];
    initialize(): void;
    private onResolve;
    private postpone;
    private onResolveEnd;
}
