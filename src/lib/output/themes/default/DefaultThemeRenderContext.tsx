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

        // TODO: Proxying this is ugly.
        this.partials = new Proxy(partials, {
            get: (target: any, key) => {
                if (key in target && typeof target[key] == "function") {
                    return (...args: any) => target[key](this, ...args);
                }
            },
        });
    }

    relativeURL = (url: string | undefined) => {
        return url ? this.markedHelpers.getRelativeUrl(url) : url;
    };

    markdown = (md: string | undefined) => {
        return md ? this.markedHelpers.parseMarkdown(md) : "";
    };
}
