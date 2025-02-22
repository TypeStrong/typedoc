import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { DocumentReflection } from "../../../../models/index.js";
import type { PageEvent } from "../../../events.js";
import { JSX } from "#utils";

export const documentTemplate = ({ markdown }: DefaultThemeRenderContext, props: PageEvent<DocumentReflection>) => (
    <div class="tsd-panel tsd-typography">
        <JSX.Raw html={markdown(props.model.content)} />
    </div>
);
