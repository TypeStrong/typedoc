import { With } from "../../../lib";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { QueryType } from "../../../../../models";
export const query = ({partials }: DefaultThemeRenderContext) => (props: QueryType) => (
    <>
        <span className="tsd-signature-symbol">typeof </span>
        {With(props.queryType, (props) => (
            <>{partials.type(props)}</>
        ))}
    </>
);
