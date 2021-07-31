import { wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { ContainerReflection } from "../../../../models";
export const index =
    ({ relativeURL }: DefaultThemeRenderContext) =>
    (props: ContainerReflection) =>
        props.categories && props.categories.length > 0 ? (
            <section className="tsd-panel-group tsd-index-group">
                <h2>Index</h2>
                <section className="tsd-panel tsd-index-panel">
                    <div className="tsd-index-content">
                        {props.categories.map((item) => (
                            <section className="tsd-index-section">
                                <h3>{item.title}</h3>
                                <ul className="tsd-index-list">
                                    {item.children.map((item) => (
                                        <li className={item.cssClasses}>
                                            <a href={relativeURL(item.url)} className="tsd-kind-icon">
                                                {item.name ? wbr(item.name) : <em>{wbr(item.kindString!)}</em>}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </section>
            </section>
        ) : (
            !!props.groups && (
                <section className="tsd-panel-group tsd-index-group">
                    <h2>Index</h2>
                    <section className="tsd-panel tsd-index-panel">
                        <div className="tsd-index-content">
                            {props.groups.map((item) => (
                                <section className={"tsd-index-section " + item.cssClasses}>
                                    {item.categories ? (
                                        item.categories.map((item2) => (
                                            <>
                                                <h3>
                                                    {!!item2.title && <>{item2.title} </>}
                                                    {item.title}
                                                </h3>
                                                <ul className="tsd-index-list">
                                                    {item2.children.map((item) => (
                                                        <li className={item.cssClasses}>
                                                            <a href={relativeURL(item.url)} className="tsd-kind-icon">
                                                                {item.name ? (
                                                                    wbr(item.name)
                                                                ) : (
                                                                    <em>{wbr(item.kindString!)}</em>
                                                                )}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ))
                                    ) : (
                                        <>
                                            <h3>{item.title}</h3>
                                            <ul className="tsd-index-list">
                                                {item.children.map((item) => (
                                                    <li className={item.cssClasses}>
                                                        <a href={relativeURL(item.url)} className="tsd-kind-icon">
                                                            {item.name ? (
                                                                wbr(item.name)
                                                            ) : (
                                                                <em>{wbr(item.kindString!)}</em>
                                                            )}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </section>
                            ))}
                        </div>
                    </section>
                </section>
            )
        );
