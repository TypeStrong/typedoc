import { OptionsComponent } from '../options';
import { DeclarationOption } from '../declaration';
export declare class TypeScriptSource extends OptionsComponent {
    private declarations;
    static IGNORED: string[];
    initialize(): void;
    getOptionDeclarations(): DeclarationOption[];
    private addTSOption;
}
