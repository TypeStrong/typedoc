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
}
