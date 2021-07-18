import {With, __partials__, Compact, IfCond, IfNotCond, Markdown} from '../../../lib';
import React from 'react';
import { TemplateLiteralType } from '../../../../typedoc/src/lib/models';
export const templateLiteral = (props: TemplateLiteralType) => <>
    <span className="tsd-signature-symbol">`</span>
  {!!props.head && <>        <span className="tsd-signature-type">{props.head}</span>
  </>}{props.tail.map((item, i) => <>        <span className="tsd-signature-symbol">${"{"}</span>
        { With(item, item.this.[0], (superProps, props) => (<>
            {__partials__.type(props)}
        </>)) }
        <span className="tsd-signature-symbol">{"}"}</span>
    {!!item.1 && <>            <span className="tsd-signature-type">{item.1}</span>
    </>}</>)}    <span className="tsd-signature-symbol">`</span>
</>;
