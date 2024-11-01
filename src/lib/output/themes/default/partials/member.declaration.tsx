import type { DeclarationReflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import { FormattedCodeBuilder, FormattedCodeGenerator, Wrap, type FormatterNode } from "../../../formatter.js";
import { hasTypeParameters } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

export function memberDeclaration(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    const builder = new FormattedCodeBuilder(context.urlTo);
    const content: FormatterNode[] = [];
    builder.member(content, props, { topLevelLinks: false });
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.node({ type: "nodes", content }, Wrap.Detect);

    /** Fix for #2717. If type is the same as value the default value is omitted */
    function shouldRenderDefaultValue() {
        if (props.type && props.type.type === "literal") {
            const reflectionTypeString = props.type.toString();

            const defaultValue = props.defaultValue;

            if (defaultValue === undefined || reflectionTypeString === defaultValue.toString()) {
                return false;
            }
        }
        return true;
    }

    return (
        <>
            <div class="tsd-signature">
                {generator.toElement()}
                {!!props.defaultValue && shouldRenderDefaultValue() && (
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
