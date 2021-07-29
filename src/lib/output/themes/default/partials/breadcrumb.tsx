import { With } from "../../lib";
import {DefaultThemeRenderContext} from '../DefaultThemeRenderContext';
import * as React from "react";
import { Reflection } from "../../../../models";
export const breadcrumb = ({relativeURL, partials }: DefaultThemeRenderContext) => (props: Reflection): React.ReactElement | undefined =>
    props.parent ? (
        <>

            {With(props.parent, (props) => (
                <>{partials.breadcrumb(props)}</>
            ))}
            <li>
                {props.url ? (
                    <>
                        <a href={relativeURL(props.url)}>{props.name}</a>
                    </>
                ) : (
                    <>

                        <span>{props.name}</span>
                    </>
                )}
            </li>
        </>
    ) : (
        props.url ? (
            <>

                <li>
                    <a href={relativeURL(props.url)}>{props.name}</a>
                </li>
            </>
        ) : undefined
    );
