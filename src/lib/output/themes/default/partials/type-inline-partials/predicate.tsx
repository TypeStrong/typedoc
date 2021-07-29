import { With } from "../../../lib";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { PredicateType } from "../../../../../models";
export const predicate = ({partials }: DefaultThemeRenderContext) => (props: PredicateType) => (
    <>
        {!!props.asserts && (
            <>

                <span className="tsd-signature-symbol">asserts </span>
            </>
        )}
        <span className="tsd-signature-type">{props.name}</span>
        {!!props.targetType && (
            <>

                <span className="tsd-signature-symbol"> is </span>
                {With(props.targetType, (props) => (
                    <>{partials.type(props)}</>
                ))}
            </>
        )}
    </>
);
