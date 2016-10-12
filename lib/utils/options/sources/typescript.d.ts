import { OptionsComponent } from "../options";
import { IOptionDeclaration } from "../declaration";
export declare class TypeScriptSource extends OptionsComponent {
    private declarations;
    static IGNORED: string[];
    initialize(): void;
    getOptionDeclarations(): IOptionDeclaration[];
    private addTSOption(option);
}
