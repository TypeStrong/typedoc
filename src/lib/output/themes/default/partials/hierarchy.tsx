import { __partials__ } from "../../lib";
import * as React from "react";
import { DeclarationHierarchy } from "../../../../models";
export const hierarchy = (props: DeclarationHierarchy) => (
        <ul className="tsd-hierarchy">
            {props.types.map((item, i, l) =>
                <li>
                    {props.isTarget ?
                        <span className="target">{item.toString()}</span>
                    :
                        __partials__.type(item)
                    }
                    {i === l.length - 1 && !!props.next &&
                        __partials__.hierarchy(props.next)
                    }
                </li>
            )}
        </ul>
);
