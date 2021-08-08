import { DefaultThemePartials } from "./DefaultThemePartials";
import { MarkedPlugin } from "../MarkedPlugin";
import { Element } from "../../../utils/jsx";

type ApplyContext<T extends Record<keyof T, (ctx: DefaultThemeRenderContext, ..._: any) => Element | undefined>> = {
    [K in keyof T]: T[K] extends (ctx: DefaultThemeRenderContext, ..._: infer A) => infer R ? (..._: A) => R : T[K];
};

export class DefaultThemeRenderContext {
    markedHelpers: MarkedPlugin;
    partials: ApplyContext<DefaultThemePartials>;

    constructor(markedHelpers: MarkedPlugin, partials: DefaultThemePartials) {
        this.markedHelpers = markedHelpers;

        // TODO: Move partials into the context class?
        // https://discord.com/channels/508357248330760243/508357707602853888/873993671777873950
        this.partials = {} as ApplyContext<DefaultThemePartials>;
        for (const [k, v] of Object.entries(partials)) {
            this.partials[k as keyof DefaultThemePartials] = (...args: any) => v(this, ...args);
        }
    }

    relativeURL = (url: string | undefined) => {
        return url ? this.markedHelpers.getRelativeUrl(url) : url;
    };

    markdown = (md: string | undefined) => {
        return md ? this.markedHelpers.parseMarkdown(md) : "";
    };
}
