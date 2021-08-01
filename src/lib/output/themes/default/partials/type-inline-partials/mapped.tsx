import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement, JSX } from "../../../../../utils";
import { MappedType } from "../../../../../models";

export const mapped =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: MappedType) => {
        const children: JSX.Element[] = [];

        switch (props.readonlyModifier) {
            case "+":
                children.push(<span class="tsd-signature-symbol">readonly </span>);
                break;
            case "-":
                children.push(<span class="tsd-signature-symbol">-readonly </span>);
                break;
        }

        children.push(
            <span class="tsd-signature-symbol">[ </span>,
            <span class="tsd-signature-type">{props.parameter}</span>,
            <span class="tsd-signature-symbol"> in </span>,
            partials.type(props.parameterType)
        );

        if (props.nameType) {
            children.push(<span class="tsd-signature-symbol"> as </span>, partials.type(props.nameType));
        }

        children.push(<span class="tsd-signature-symbol">]</span>);

        switch (props.optionalModifier) {
            case "+":
                children.push(<span class="tsd-signature-symbol">?: </span>);
                break;
            case "-":
                children.push(<span class="tsd-signature-symbol">-?: </span>);
                break;
            default:
                children.push(<span class="tsd-signature-symbol">: </span>);
        }

        children.push(partials.type(props.templateType));

        return (
            <>
                <span class="tsd-signature-symbol">{"{"}</span> {children}{" "}
                <span class="tsd-signature-symbol">{"}"}</span>
            </>
        );
    };
