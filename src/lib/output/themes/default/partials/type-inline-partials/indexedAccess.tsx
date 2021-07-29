import { With } from "../../../lib";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { IndexedAccessType } from "../../../../../models";
export const indexedAccess = ({partials }: DefaultThemeRenderContext) => (props: IndexedAccessType) => (
    <>
        {With(props.objectType, (props) => (
            <>{partials.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">[</span>
        {With(props.indexType, (props) => (
            <>{partials.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">]</span>
    </>
);
