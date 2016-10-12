import { DiscoverEvent, OptionsComponent } from "../options";
export declare class ArgumentsReader extends OptionsComponent {
    initialize(): void;
    onDiscover(event: DiscoverEvent): void;
    private parseArguments(event, args?);
    private parseResponseFile(event, filename);
}
