import { wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { ContainerReflection } from "../../../../models";
export const index =
    ({ relativeURL }: DefaultThemeRenderContext) =>
    (props: ContainerReflection) =>
        props.categories && props.categories.length > 0 ? (
            <section class="tsd-panel-group tsd-index-group">
                <h2>Index</h2>
                <section class="tsd-panel tsd-index-panel">
                    <div class="tsd-index-content">
                        {props.categories.map((item) => (
                            <section class="tsd-index-section">
                                <h3>{item.title}</h3>
                                <ul class="tsd-index-list">
                                    {item.children.map((item) => (
                                        <li class={item.cssClasses}>
                                            <a href={relativeURL(item.url)} class="tsd-kind-icon">
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
                <section class="tsd-panel-group tsd-index-group">
                    <h2>Index</h2>
                    <section class="tsd-panel tsd-index-panel">
                        <div class="tsd-index-content">
                            {props.groups.map((item) => (
                                <section class={"tsd-index-section " + item.cssClasses}>
                                    {item.categories ? (
                                        item.categories.map((item2) => (
                                            <>
                                                <h3>
                                                    {!!item2.title && <>{item2.title} </>}
                                                    {item.title}
                                                </h3>
                                                <ul class="tsd-index-list">
                                                    {item2.children.map((item) => (
                                                        <li class={item.cssClasses}>
                                                            <a href={relativeURL(item.url)} class="tsd-kind-icon">
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
                                            <ul class="tsd-index-list">
                                                {item.children.map((item) => (
                                                    <li class={item.cssClasses}>
                                                        <a href={relativeURL(item.url)} class="tsd-kind-icon">
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
