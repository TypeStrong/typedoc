import { With } from "../../../lib";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { NamedTupleMember } from "../../../../../models";
export const namedTupleMember = ({partials }: DefaultThemeRenderContext) => (props: NamedTupleMember) => (
    <>
        {props.name}
        {props.isOptional ? (
            <>

                <span className="tsd-signature-symbol">?: </span>
            </>
        ) : (
            <>

                <span className="tsd-signature-symbol">: </span>
            </>
        )}
        {With(props.element, (props) => (
            <>{partials.type(props)}</>
        ))}
    </>
);
