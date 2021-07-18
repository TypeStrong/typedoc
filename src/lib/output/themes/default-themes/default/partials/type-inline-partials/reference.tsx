import {With, __partials__, Compact, IfCond, IfNotCond, Markdown} from '../../../lib';
import React from 'react';
import { ReferenceType } from '../../../../typedoc/src/lib/models';
export const reference = (props: ReferenceType) => <>
  {!!props.getReflection ? <>    { With(props, props.getReflection, (superProps, props) => (<>
        <a href={relativeURL(TODO)} className="tsd-signature-type" data-tsd-kind={props.kindString}>
            {props.name}
        </a>
    </>)) }
  </> : <>        <span className="tsd-signature-type">{props.name}</span>
  </>}{!!props.typeArguments && <>        <span className="tsd-signature-symbol"><</span>
    {props.typeArguments.map((item, i) => <>{!item.first && <>                <span className="tsd-signature-symbol">, </span>
      </>}            {__partials__.type(item)}
    </>)}        <span className="tsd-signature-symbol">></span>
  </>}</>;
