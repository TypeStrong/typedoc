module td
{
    export class CompilerEvent extends ConverterEvent
    {
        reflection:Reflection;

        node:ts.Node;
    }
}