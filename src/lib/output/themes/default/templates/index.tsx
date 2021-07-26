import { __partials__, markdown } from "../../lib";
import * as React from "react";
import { ProjectReflection } from "../../../../models";
import { PageEvent } from "../../../events";

export const indexTemplate = (props: PageEvent<ProjectReflection>) => (
    <>
        <div className="tsd-panel tsd-typography" dangerouslySetInnerHTML={{__html: markdown(props.model.readme)}}>
        </div>
    </>
);
