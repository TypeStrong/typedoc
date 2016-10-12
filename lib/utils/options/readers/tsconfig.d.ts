import { OptionsComponent, DiscoverEvent } from "../options";
export declare class TSConfigReader extends OptionsComponent {
    options: string;
    private static OPTIONS_KEY;
    initialize(): void;
    onDiscover(event: DiscoverEvent): void;
    load(event: DiscoverEvent, fileName: string): void;
}
