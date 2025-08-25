import type { DeclarationReflection } from "#models";
import { JSX } from "#utils";
import { FormattedCodeBuilder, FormattedCodeGenerator, type FormatterNode, Wrap } from "../../../formatter.js";
import { hasTypeParameters } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

function shouldRenderDefaultValue(props: DeclarationReflection) {
    const defaultValue = props.defaultValue;

    if (defaultValue === undefined) {
        return false;
    }

    /** Fix for #2717. If type is the same as value the default value is omitted */
    if (props.type && props.type.type === "literal") {
        const reflectionTypeString = props.type.toString();

        if (reflectionTypeString === defaultValue.toString()) {
            return false;
        }
    }

    return true;
}

export function memberDeclaration(context: DefaultThemeRenderContext, props: DeclarationReflection) {
    const builder = new FormattedCodeBuilder(context.router, context.model);
    const content: FormatterNode[] = [];
    builder.member(content, props, { topLevelLinks: false });
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.node({ type: "nodes", content }, Wrap.Detect);

    return (
        <>
            <div class="tsd-signature">
                {generator.toElement()}
                {shouldRenderDefaultValue(props) && (
                    <span class="tsd-signature-symbol">
                        {" = "}
                        {props.defaultValue}
                    </span>
                )}
            </div>

            {context.commentSummary(props)}

            {hasTypeParameters(props) && context.typeParameters(props.typeParameters)}

            {props.type && context.typeDeclaration(props, props.type)}

            {context.commentTags(props)}

            {context.memberSources(props)}
        </>
    );
}
