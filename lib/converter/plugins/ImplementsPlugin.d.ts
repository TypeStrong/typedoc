import { ConverterComponent } from "../components";
export declare class ImplementsPlugin extends ConverterComponent {
    initialize(): void;
    private analyzeClass(context, classReflection, interfaceReflection);
    private copyComment(target, source);
    private onResolve(context, reflection);
}
