import { Options } from './options';
export interface ParameterHelp {
    names: string[];
    helps: string[];
    margin: number;
}
export declare function getOptionsHelp(options: Options): string;
