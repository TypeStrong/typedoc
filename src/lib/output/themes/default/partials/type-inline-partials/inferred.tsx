import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { InferredType } from "../../../../../models";
export const inferred = (_ctx: DefaultThemeRenderContext) => (props: InferredType) => (
    <>
        <span className="tsd-signature-symbol">infer </span> {props.name}
    </>
);
