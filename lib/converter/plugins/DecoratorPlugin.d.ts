import { ConverterComponent } from "../components";
export declare class DecoratorPlugin extends ConverterComponent {
    private usages;
    initialize(): void;
    private extractArguments(args, signature);
    private onBegin(context);
    private onDeclaration(context, reflection, node?);
    private onBeginResolve(context);
}
