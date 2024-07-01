import type { DeclarationReflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { FormattedCodeBuilder, FormattedCodeGenerator, Wrap } from "../../../formatter.js";
import { hasTypeParameters } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

void JSX; // TS is confused and thinks this is unused

export function memberDeclaration(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    const builder = new FormattedCodeBuilder(context.urlTo);
    const tree = builder.member(props, { topLevelLinks: false });
    const generator = new FormattedCodeGenerator();
    generator.node(tree, Wrap.Detect);

    return (
        <>
            <div class="tsd-signature">
                {generator.toElement()}
                {!!props.defaultValue && (
                    <>
                        <span class="tsd-signature-symbol">
                            {" = "}
                            {props.defaultValue}
                        </span>
                    </>
                )}
            </div>

            {context.commentSummary(props)}

            {hasTypeParameters(props) && context.typeParameters(props.typeParameters)}

            {props.type && context.typeDeclaration(props.type)}

            {context.commentTags(props)}

            {context.memberSources(props)}
        </>
    );
}
