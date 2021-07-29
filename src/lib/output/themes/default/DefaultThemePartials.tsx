import { analytics } from "./partials/analytics";
import { breadcrumb } from "./partials/breadcrumb";
import { comment } from "./partials/comment";
import { footer } from "./partials/footer";
import { header } from "./partials/header";
import { hierarchy } from "./partials/hierarchy";
import { index } from "./partials/index";
import { member } from "./partials/member";
import { memberDeclaration } from "./partials/member.declaration";
import { memberGetterSetter } from "./partials/member.getterSetter";
import { memberReference } from "./partials/member.reference";
import { memberSignatureBody } from "./partials/member.signature.body";
import { memberSignatureTitle } from "./partials/member.signature.title";
import { memberSignatures } from "./partials/member.signatures";
import { memberSources } from "./partials/member.sources";
import { members } from "./partials/members";
import { membersGroup } from "./partials/members.group";
import { navigation } from "./partials/navigation";
import { parameter } from "./partials/parameter";
import { toc } from "./partials/toc";
import { tocRoot } from "./partials/toc.root";
import { type } from "./partials/type";
import { typeAndParent } from "./partials/typeAndParent";
import { typeParameters } from "./partials/typeParameters";
import { reflectionTemplate } from "./templates/reflection";
import { indexTemplate } from "./templates/index";
import { defaultLayout } from "./layouts/default";
import { array } from "./partials/type-inline-partials/array";
import { conditional } from "./partials/type-inline-partials/conditional";
import { indexedAccess } from "./partials/type-inline-partials/indexedAccess";
import { inferred } from "./partials/type-inline-partials/inferred";
import { intersection } from "./partials/type-inline-partials/intersection";
import { intrinsic } from "./partials/type-inline-partials/intrinsic";
import { literal } from "./partials/type-inline-partials/literal";
import { mapped } from "./partials/type-inline-partials/mapped";
import { namedTupleMember } from "./partials/type-inline-partials/named-tuple-member";
import { optional } from "./partials/type-inline-partials/optional";
import { predicate } from "./partials/type-inline-partials/predicate";
import { query } from "./partials/type-inline-partials/query";
import { reference } from "./partials/type-inline-partials/reference";
import { reflection } from "./partials/type-inline-partials/reflection";
import { rest } from "./partials/type-inline-partials/rest";
import { templateLiteral } from "./partials/type-inline-partials/template-literal";
import { tuple } from "./partials/type-inline-partials/tuple";
import { typeOperator } from "./partials/type-inline-partials/typeOperator";
import { typeParameter } from "./partials/type-inline-partials/typeParameter";
import { union } from "./partials/type-inline-partials/union";
import { unknown } from "./partials/type-inline-partials/unknown";
import { DefaultThemeRenderContext } from "./DefaultThemeRenderContext";


export class DefaultThemePartials {
    constructor(protected bindings: DefaultThemeRenderContext) {}
    private hack() {
        this.bindings.partials = this;
        return this.bindings;
    }

    reflectionTemplate = reflectionTemplate(this.hack());
    indexTemplate = indexTemplate(this.hack());
    defaultLayout = defaultLayout(this.hack());

    analytics = analytics(this.hack());
    breadcrumb = breadcrumb(this.hack());
    comment = comment(this.hack());
    footer = footer(this.hack());
    header = header(this.hack());
    hierarchy = hierarchy(this.hack());
    index = index(this.hack());
    member = member(this.hack());
    memberDeclaration = memberDeclaration(this.hack());
    memberGetterSetter = memberGetterSetter(this.hack());
    memberReference = memberReference(this.hack());
    memberSignatureBody = memberSignatureBody(this.hack());
    memberSignatureTitle = memberSignatureTitle(this.hack());
    memberSignatures = memberSignatures(this.hack());
    memberSources = memberSources(this.hack());
    members = members(this.hack());
    membersGroup = membersGroup(this.hack());
    navigation = navigation(this.hack());
    parameter = parameter(this.hack());
    toc = toc(this.hack());
    tocRoot = tocRoot(this.hack());
    type = type(this.hack());
    typeAndParent = typeAndParent(this.hack());
    typeParameters = typeParameters(this.hack());
    typePartials = new DefaultThemeTypePartials(this.hack());
}

export class DefaultThemeTypePartials {
    constructor(private bindings: DefaultThemeRenderContext) {}
    array = array(this.bindings);
    conditional = conditional(this.bindings);
    indexedAccess = indexedAccess(this.bindings);
    inferred = inferred(this.bindings);
    intersection = intersection(this.bindings);
    intrinsic = intrinsic(this.bindings);
    literal = literal(this.bindings);
    mapped = mapped(this.bindings);
    "named-tuple-member" = namedTupleMember(this.bindings);
    optional = optional(this.bindings);
    predicate = predicate(this.bindings);
    query = query(this.bindings);
    reference = reference(this.bindings);
    reflection = reflection(this.bindings);
    rest = rest(this.bindings);
    "template-literal" = templateLiteral(this.bindings);
    tuple = tuple(this.bindings);
    typeOperator = typeOperator(this.bindings);
    typeParameter = typeParameter(this.bindings);
    union = union(this.bindings);
    unknown = unknown(this.bindings);
}
