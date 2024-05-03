import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { DocumentReflection } from "../../../../models";
import type { PageEvent } from "../../../events";
import { JSX, Raw } from "../../../../utils";

export const documentTemplate = ({ markdown }: DefaultThemeRenderContext, props: PageEvent<DocumentReflection>) => (
    <div class="tsd-panel tsd-typography">
        <Raw html={markdown(props.model.content)} />
    </div>
);
