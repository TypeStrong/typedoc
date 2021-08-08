import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { Type, TypeKindMap } from "../../../../models";
import { createElement, JSX } from "../../../../utils";
import { join, stringify } from "../../lib";

type TypeInlinePartialsOptions = { needsParens?: boolean };

// The type helper accepts an optional needsParens parameter that is checked
// if an inner type may result in invalid output without them. For example:
// 1 | 2[] !== (1 | 2)[]
// () => 1 | 2 !== (() => 1) | 2
const typeRenderers: {
    [K in keyof TypeKindMap]: (
        context: DefaultThemeRenderContext,
        type: TypeKindMap[K],
        options: TypeInlinePartialsOptions
    ) => JSX.Element;
} = {
    array(context, type) {
        return (
            <>
                {renderType(context, type.elementType, { needsParens: true })}
                <span class="tsd-signature-symbol">[]</span>
            </>
        );
    },
    conditional(context, type, { needsParens }) {
        return (
            <>
                {needsParens && <span class="tsd-signature-symbol">(</span>}
                {renderType(context, type.checkType, { needsParens: true })}
                <span class="tsd-signature-symbol"> extends </span>
                {renderType(context, type.extendsType)}
                <span class="tsd-signature-symbol"> ? </span>
                {renderType(context, type.trueType)}
                <span class="tsd-signature-symbol"> : </span>
                {renderType(context, type.falseType)}
                {needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
    },
    indexedAccess(context, type) {
        return (
            <>
                {renderType(context, type.objectType)}
                <span class="tsd-signature-symbol">[</span>
                {renderType(context, type.indexType)}
                <span class="tsd-signature-symbol">]</span>
            </>
        );
    },
    inferred(_context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">infer </span> {type.name}
            </>
        );
    },
    intersection(context, type, { needsParens }) {
        return (
            <>
                {needsParens && <span class="tsd-signature-symbol">(</span>}
                {join(<span class="tsd-signature-symbol"> & </span>, type.types, (item) =>
                    renderType(context, item, { needsParens: true })
                )}
                {needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
    },
    intrinsic(_context, type) {
        return <span class="tsd-signature-type">{type.name}</span>;
    },
    literal(_context, type) {
        return <span class="tsd-signature-type">{stringify(type.value)}</span>;
    },
    mapped(context, type) {
        const children: JSX.Element[] = [];

        switch (type.readonlyModifier) {
            case "+":
                children.push(<span class="tsd-signature-symbol">readonly </span>);
                break;
            case "-":
                children.push(<span class="tsd-signature-symbol">-readonly </span>);
                break;
        }

        children.push(
            <span class="tsd-signature-symbol">[ </span>,
            <span class="tsd-signature-type">{type.parameter}</span>,
            <span class="tsd-signature-symbol"> in </span>,
            renderType(context, type.parameterType)
        );

        if (type.nameType) {
            children.push(<span class="tsd-signature-symbol"> as </span>, renderType(context, type.nameType));
        }

        children.push(<span class="tsd-signature-symbol">]</span>);

        switch (type.optionalModifier) {
            case "+":
                children.push(<span class="tsd-signature-symbol">?: </span>);
                break;
            case "-":
                children.push(<span class="tsd-signature-symbol">-?: </span>);
                break;
            default:
                children.push(<span class="tsd-signature-symbol">: </span>);
        }

        children.push(renderType(context, type.templateType));

        return (
            <>
                <span class="tsd-signature-symbol">{"{"}</span> {children}{" "}
                <span class="tsd-signature-symbol">{"}"}</span>
            </>
        );
    },
    "named-tuple-member"(context, type) {
        return (
            <>
                {type.name}
                {type.isOptional ? (
                    <span class="tsd-signature-symbol">?: </span>
                ) : (
                    <span class="tsd-signature-symbol">: </span>
                )}
                {renderType(context, type.element)}
            </>
        );
    },
    optional(context, type) {
        return (
            <>
                {renderType(context, type.elementType)}
                <span class="tsd-signature-symbol">?</span>
            </>
        );
    },
    predicate(context, type) {
        return (
            <>
                {!!type.asserts && <span class="tsd-signature-symbol">asserts </span>}
                <span class="tsd-signature-type">{type.name}</span>
                {!!type.targetType && (
                    <>
                        <span class="tsd-signature-symbol"> is </span>
                        {renderType(context, type.targetType)}
                    </>
                )}
            </>
        );
    },
    query(context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">typeof </span>
                {renderType(context, type.queryType)}
            </>
        );
    },
    reference(context, type) {
        const reflection = type.reflection;

        const name = reflection ? (
            <a
                href={context.relativeURL(reflection.url) || ""}
                class="tsd-signature-type"
                data-tsd-kind={reflection.kindString}
            >
                {reflection.name}
            </a>
        ) : (
            <span class="tsd-signature-type">{type.name}</span>
        );

        if (type.typeArguments?.length) {
            return (
                <>
                    {name}
                    <span class="tsd-signature-symbol">{"<"}</span>
                    {join(<span class="tsd-signature-symbol">, </span>, type.typeArguments, (item) =>
                        renderType(context, item)
                    )}
                    <span class="tsd-signature-symbol">{">"}</span>
                </>
            );
        }

        return name;
    },
    reflection(context, type, { needsParens }) {
        if (type.declaration.children) {
            // Object literal
            return (
                <>
                    <span class="tsd-signature-symbol">{"{ "}</span>
                    {join(<span class="tsd-signature-symbol">; </span>, type.declaration.children, (item) => {
                        if (item.getSignature && item.setSignature) {
                            return (
                                <>
                                    {item.name}
                                    <span class="tsd-signature-symbol">: </span>
                                    {renderType(context, item.getSignature.type)}
                                </>
                            );
                        }

                        if (item.getSignature) {
                            return (
                                <>
                                    <span class="tsd-signature-symbol">get </span>
                                    {item.name}
                                    <span class="tsd-signature-symbol">(): </span>
                                    {renderType(context, item.getSignature.type)}
                                </>
                            );
                        }

                        if (item.setSignature) {
                            return (
                                <>
                                    <span class="tsd-signature-symbol">set </span>
                                    {item.name}
                                    <span class="tsd-signature-symbol">(</span>
                                    {item.setSignature.parameters?.map((item) => (
                                        <>
                                            {item.name}
                                            <span class="tsd-signature-symbol">: </span>
                                            {renderType(context, item.type)}
                                        </>
                                    ))}
                                    <span class="tsd-signature-symbol">)</span>
                                </>
                            );
                        }

                        return (
                            <>
                                {item.name}
                                <span class="tsd-signature-symbol">{item.flags.isOptional ? "?: " : ": "}</span>
                                {renderType(context, item.type)}
                            </>
                        );
                    })}
                    <span class="tsd-signature-symbol">{" }"}</span>
                </>
            );
        }

        if (type.declaration.signatures?.length === 1) {
            return (
                <>
                    {needsParens && <span class="tsd-signature-symbol">(</span>}
                    {context.memberSignatureTitle(type.declaration.signatures[0], {
                        hideName: true,
                        arrowStyle: true,
                    })}
                    {needsParens && <span class="tsd-signature-symbol">)</span>}
                </>
            );
        }

        if (type.declaration.signatures) {
            return (
                <>
                    <span class="tsd-signature-symbol">{"{"} </span>
                    {join(<span class="tsd-signature-symbol">; </span>, type.declaration.signatures, (item) =>
                        context.memberSignatureTitle(item, { hideName: true })
                    )}
                    <span class="tsd-signature-symbol">{" }"}</span>
                </>
            );
        }

        return <span class="tsd-signature-symbol">{"{}"}</span>;
    },
    rest(context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">...</span>
                {renderType(context, type.elementType)}
            </>
        );
    },
    "template-literal"(context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">`</span>
                {type.head && <span class="tsd-signature-type">{type.head}</span>}
                {type.tail.map((item) => (
                    <>
                        <span class="tsd-signature-symbol">{"${"}</span>
                        {renderType(context, item[0])}
                        <span class="tsd-signature-symbol">{"}"}</span>
                        {item[1] && <span class="tsd-signature-type">{item[1]}</span>}
                    </>
                ))}
                <span class="tsd-signature-symbol">`</span>
            </>
        );
    },
    tuple(context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">[</span>
                {join(<span class="tsd-signature-symbol">, </span>, type.elements, (item) => renderType(context, item))}
                <span class="tsd-signature-symbol">]</span>
            </>
        );
    },
    typeOperator(context, type) {
        return (
            <>
                <span class="tsd-signature-symbol">{type.operator} </span>
                {renderType(context, type.target)}
            </>
        );
    },
    union(context, type, { needsParens }) {
        return (
            <>
                {!!needsParens && <span class="tsd-signature-symbol">(</span>}
                {join(<span class="tsd-signature-symbol"> | </span>, type.types, (item) =>
                    renderType(context, item, { needsParens: true })
                )}
                {!!needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
    },
    unknown(_context, type) {
        return <>{type.name}</>;
    },
};

function renderType(context: DefaultThemeRenderContext, type: Type | undefined, options?: TypeInlinePartialsOptions) {
    if (!type) {
        return <span class="tsd-signature-type">any</span>;
    }

    const renderFn = typeRenderers[type.type];
    return renderFn(context, type as never, options ?? {});
}

export { renderType as type };
