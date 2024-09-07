import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { type SignatureReflection } from "../../../../models/index.js";
import { FormattedCodeBuilder, FormattedCodeGenerator, Wrap } from "../../../formatter.js";

export function memberSignatureTitle(
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    options: { hideName?: boolean } = {},
) {
    const builder = new FormattedCodeBuilder(context.urlTo);
    const tree = builder.signature(props, options);
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.node(tree, Wrap.Detect);
    return generator.toElement();
}
