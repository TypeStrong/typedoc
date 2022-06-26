import { JSX } from "../../../../utils";
import { icons } from "./icon";

export const anchorIcon = (anchor: string | undefined) => (
    <a href={`#${anchor}`} aria-label="Permalink" class="tsd-anchor-icon">
        {icons.anchor()}
    </a>
);
