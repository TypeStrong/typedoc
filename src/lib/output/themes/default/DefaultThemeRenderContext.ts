import type { RendererHooks } from "../..";
import type {
    CommentDisplayPart,
    ReferenceType,
    Reflection,
} from "../../../models";
import type { NeverIfInternal, Options } from "../../../utils";
import { displayPartsToMarkdown } from "../lib";
import type { DefaultTheme } from "./DefaultTheme";
import { defaultLayout } from "./layouts/default";
import { index } from "./partials";
import { analytics } from "./partials/analytics";
import { breadcrumb } from "./partials/breadcrumb";
import { comment } from "./partials/comment";
import { footer } from "./partials/footer";
import { header } from "./partials/header";
import { hierarchy } from "./partials/hierarchy";
import { icons } from "./partials/icon";
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
import {
    navigation,
    primaryNavigation,
    secondaryNavigation,
    settings,
    sidebarLinks,
} from "./partials/navigation";
import { parameter } from "./partials/parameter";
import { toolbar } from "./partials/toolbar";
import { type } from "./partials/type";
import { typeAndParent } from "./partials/typeAndParent";
import { typeParameters } from "./partials/typeParameters";
import { indexTemplate } from "./templates";
import { reflectionTemplate } from "./templates/reflection";

function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
    return (...r: L) => fn(first, ...r);
}

export class DefaultThemeRenderContext {
    options: Options;

    constructor(private theme: DefaultTheme, options: Options) {
        this.options = options;
    }

    icons = icons;

    hook = (name: keyof RendererHooks) =>
        this.theme.owner.hooks.emit(name, this);

    /** Avoid this in favor of urlTo if possible */
    relativeURL = (url: string | undefined) => {
        return url ? this.theme.markedPlugin.getRelativeUrl(url) : url;
    };

    urlTo = (reflection: Reflection) => this.relativeURL(reflection.url);

    markdown = (
        md: readonly CommentDisplayPart[] | NeverIfInternal<string | undefined>
    ) => {
        if (md instanceof Array) {
            return this.theme.markedPlugin.parseMarkdown(
                displayPartsToMarkdown(md, this.urlTo)
            );
        }
        return md ? this.theme.markedPlugin.parseMarkdown(md) : "";
    };

    /**
     * Using this method will repeat work already done, instead of calling it, use `type.externalUrl`.
     * @deprecated
     * Will be removed in 0.24.
     */
    attemptExternalResolution = (type: NeverIfInternal<ReferenceType>) => {
        return (type as ReferenceType).externalUrl;
    };

    reflectionTemplate = bind(reflectionTemplate, this);
    indexTemplate = bind(indexTemplate, this);
    defaultLayout = bind(defaultLayout, this);

    analytics = bind(analytics, this);
    breadcrumb = bind(breadcrumb, this);
    comment = bind(comment, this);
    footer = bind(footer, this);
    header = bind(header, this);
    hierarchy = bind(hierarchy, this);
    index = bind(index, this);
    member = bind(member, this);
    memberDeclaration = bind(memberDeclaration, this);
    memberGetterSetter = bind(memberGetterSetter, this);
    memberReference = bind(memberReference, this);
    memberSignatureBody = bind(memberSignatureBody, this);
    memberSignatureTitle = bind(memberSignatureTitle, this);
    memberSignatures = bind(memberSignatures, this);
    memberSources = bind(memberSources, this);
    members = bind(members, this);
    membersGroup = bind(membersGroup, this);
    navigation = bind(navigation, this);
    sidebarLinks = bind(sidebarLinks, this);
    settings = bind(settings, this);
    primaryNavigation = bind(primaryNavigation, this);
    secondaryNavigation = bind(secondaryNavigation, this);
    parameter = bind(parameter, this);
    toolbar = bind(toolbar, this);
    type = bind(type, this);
    typeAndParent = bind(typeAndParent, this);
    typeParameters = bind(typeParameters, this);
}
