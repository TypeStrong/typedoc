module TypeDoc.Models
{
    export class LateResolvingType extends BaseType
    {
        declaration:TypeScript.PullDecl;

        symbol:TypeScript.PullTypeSymbol;


        constructor(declaration:TypeScript.PullDecl);
        constructor(symbol:TypeScript.PullTypeSymbol);
        constructor(target:any) {
            super();

            if (target instanceof TypeScript.PullDecl) {
                this.declaration = <TypeScript.PullDecl>target;
                this.symbol = <TypeScript.PullTypeSymbol>this.declaration.getSymbol();
            } else if (target instanceof TypeScript.PullTypeSymbol) {
                this.symbol = <TypeScript.PullTypeSymbol>target;
                this.declaration = this.symbol.getDeclarations()[0];
            }
        }
    }
}