import { array } from "./array";
import { conditional } from "./conditional";
import { indexedAccess } from "./indexedAccess";
import { inferred } from "./inferred";
import { intersection } from "./intersection";
import { intrinsic } from "./intrinsic";
import { literal } from "./literal";
import { mapped } from "./mapped";
import { namedTupleMember } from "./named-tuple-member";
import { optional } from "./optional";
import { predicate } from "./predicate";
import { query } from "./query";
import { reference } from "./reference";
import { reflection } from "./reflection";
import { rest } from "./rest";
import { templateLiteral } from "./template-literal";
import { tuple } from "./tuple";
import { typeOperator } from "./typeOperator";
import { typeParameter } from "./typeParameter";
import { union } from "./union";
import { unknown } from "./unknown";

export const typePartials = {
    array,
    conditional,
    indexedAccess,
    inferred,
    intersection,
    intrinsic,
    literal,
    mapped,
    "named-tuple-member": namedTupleMember,
    optional,
    predicate,
    query,
    reference,
    reflection,
    rest,
    "template-literal": templateLiteral,
    tuple,
    typeOperator,
    typeParameter,
    union,
    unknown,
};
