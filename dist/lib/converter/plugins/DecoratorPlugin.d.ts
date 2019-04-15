import { ConverterComponent } from '../components';
export declare class DecoratorPlugin extends ConverterComponent {
    private usages;
    initialize(): void;
    private extractArguments;
    private onBegin;
    private onDeclaration;
    private onBeginResolve;
}
