import { OptionsComponent, DiscoverEvent } from "../options";
export declare class TypedocReader extends OptionsComponent {
    options: string;
    private static OPTIONS_KEY;
    initialize(): void;
    onDiscover(event: DiscoverEvent): void;
    load(event: DiscoverEvent, optionFile: string): void;
}
