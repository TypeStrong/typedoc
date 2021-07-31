import { With, IfCond, IfNotCond } from "../../../lib";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { MappedType } from "../../../../../models";
export const mapped =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: MappedType) =>
        (
            <>
                <span className="tsd-signature-symbol">{"{"}</span>
                <IfCond cond={props.readonlyModifier === "+"}>
                    <span className="tsd-signature-symbol">readonly </span>
                </IfCond>
                <IfNotCond cond={props.readonlyModifier === "+"}>
                    <IfCond cond={props.readonlyModifier === "-"}>
                        <span className="tsd-signature-symbol">-readonly </span>
                    </IfCond>
                </IfNotCond>

                <span className="tsd-signature-symbol">[ </span>
                <span className="tsd-signature-type">{props.parameter}</span>
                <span className="tsd-signature-symbol"> in </span>

                {With(props.parameterType, (props) => (
                    <>{partials.type(props)}</>
                ))}

                {With(props.nameType, (props) => (
                    <>
                        <span className="tsd-signature-symbol"> as </span>
                        {partials.type(props)}
                    </>
                ))}

                <span className="tsd-signature-symbol">]</span>
                <IfCond cond={props.readonlyModifier === "+"}>
                    <span className="tsd-signature-symbol">?: </span>
                </IfCond>
                <IfNotCond cond={props.readonlyModifier === "+"}>
                    <IfCond cond={props.readonlyModifier === "-"}>
                        <span className="tsd-signature-symbol">-?: </span>
                    </IfCond>
                    <IfNotCond cond={props.readonlyModifier === "-"}>
                        <span className="tsd-signature-symbol">: </span>
                    </IfNotCond>
                </IfNotCond>

                {With(props.templateType, (props) => (
                    <>{partials.type(props)}</>
                ))}

                <span className="tsd-signature-symbol"> {"}"}</span>
            </>
        );
