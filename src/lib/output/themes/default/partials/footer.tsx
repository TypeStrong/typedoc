import { JSX } from "../../../../utils";
import { classNames } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function footer(context: DefaultThemeRenderContext) {
    const hideGenerator = context.options.getValue("hideGenerator");
    return (
        <>
            <footer
                class={classNames({
                    "with-border-bottom": !hideGenerator,
                })}
            >
                <div class="container">
                    <h2>Settings</h2>
                    <p>
                        Theme{" "}
                        <select id="theme">
                            <option value="os">OS</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </p>
                </div>
            </footer>

            {!hideGenerator && (
                <div class="container tsd-generator">
                    <p>
                        {"Generated using "}
                        <a href="https://typedoc.org/" target="_blank">
                            TypeDoc
                        </a>
                    </p>
                </div>
            )}
        </>
    );
}
