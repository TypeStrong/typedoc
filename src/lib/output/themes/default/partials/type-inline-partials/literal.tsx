import { stringify } from "../../../lib";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { LiteralType } from "../../../../../models";
export const literal = (_ctx: DefaultThemeRenderContext) => (props: LiteralType) => (
    <>
        <span className="tsd-signature-type">{stringify(props.value)}</span>
    </>
);
