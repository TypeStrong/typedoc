import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { FormattedCodeBuilder, FormattedCodeGenerator, Wrap } from "../../../formatter.js";
import { type SomeType, TypeContext } from "../../../../models/types.js";

export function type(
    context: DefaultThemeRenderContext,
    type: SomeType | undefined,
    options: { topLevelLinks: boolean } = { topLevelLinks: false },
) {
    const builder = new FormattedCodeBuilder(context.router, context.model);
    const tree = builder.type(type, TypeContext.none, options);
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.node(tree, Wrap.Detect);
    return generator.toElement();
}
