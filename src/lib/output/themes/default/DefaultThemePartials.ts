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
import { Element } from "../../../utils/jsx";
import { PageEvent } from "../../events";
import {
    ContainerReflection,
    DeclarationHierarchy,
    DeclarationReflection,
    ProjectReflection,
    ReferenceReflection,
    Reflection,
    ReflectionGroup,
    SignatureReflection,
    Type,
    TypeParameterContainer,
} from "../../../models";
import { NavigationItem } from "../../models/NavigationItem";

export type ThemePartial<T> = (
    context: DefaultThemeRenderContext,
    props: T
) => Element | undefined;

export type ThemePartialRequired<T> = (
    context: DefaultThemeRenderContext,
    props: T
) => Element;

export interface DefaultThemePartials {
    reflectionTemplate: ThemePartialRequired<PageEvent<ContainerReflection>>;
    indexTemplate: ThemePartialRequired<PageEvent<ProjectReflection>>;
    defaultLayout: ThemePartialRequired<PageEvent<Reflection>>;

    analytics: ThemePartial<PageEvent<Reflection>>;
    breadcrumb: ThemePartial<Reflection>;
    comment: ThemePartial<Reflection>;
    footer: ThemePartial<PageEvent<Reflection>>;
    header: ThemePartial<PageEvent<Reflection>>;
    hierarchy: ThemePartial<DeclarationHierarchy>;
    index: ThemePartial<ContainerReflection>;
    member: ThemePartial<DeclarationReflection>;
    memberDeclaration: ThemePartial<DeclarationReflection>;
    memberGetterSetter: ThemePartial<DeclarationReflection>;
    memberReference: ThemePartial<ReferenceReflection>;
    memberSignatureBody: (
        context: DefaultThemeRenderContext,
        props: SignatureReflection,
        options?: { hideSources?: boolean }
    ) => Element;
    memberSignatureTitle: (
        context: DefaultThemeRenderContext,
        props: SignatureReflection,
        options?: { hideName?: boolean; arrowStyle?: boolean }
    ) => Element;
    memberSignatures: ThemePartial<DeclarationReflection>;
    memberSources: ThemePartial<DeclarationReflection | SignatureReflection>;
    members: ThemePartial<ContainerReflection>;
    membersGroup: ThemePartial<ReflectionGroup>;
    navigation: ThemePartial<NavigationItem>;
    parameter: ThemePartial<DeclarationReflection>;
    toc: ThemePartial<NavigationItem>;
    tocRoot: ThemePartial<NavigationItem>;
    type: ThemePartial<Type | undefined>;
    typeAndParent: ThemePartial<Type>;
    typeParameters: ThemePartial<TypeParameterContainer>;
}

export const defaultThemePartials: DefaultThemePartials = {
    reflectionTemplate,
    indexTemplate,
    defaultLayout,

    analytics,
    breadcrumb,
    comment,
    footer,
    header,
    hierarchy,
    index,
    member,
    memberDeclaration,
    memberGetterSetter,
    memberReference,
    memberSignatureBody,
    memberSignatureTitle,
    memberSignatures,
    memberSources,
    members,
    membersGroup,
    navigation,
    parameter,
    toc,
    tocRoot,
    type,
    typeAndParent,
    typeParameters,
};
