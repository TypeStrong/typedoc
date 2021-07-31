import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { IndexedAccessType } from "../../../../../models";
export const indexedAccess =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: IndexedAccessType) =>
        (
            <>
                {partials.type(props.objectType)}
                <span className="tsd-signature-symbol">[</span>
                {partials.type(props.indexType)}
                <span className="tsd-signature-symbol">]</span>
            </>
        );
