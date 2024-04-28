import type { PageEvent, RendererHooks } from "../../index.js";
import type {
    Internationalization,
    TranslationProxy,
} from "../../../internationalization/internationalization.js";
import {
    Comment,
    type CommentDisplayPart,
    DeclarationReflection,
    Reflection,
} from "../../../models/index.js";
import { JSX, type NeverIfInternal, Options } from "../../../utils/index.js";
import type { DefaultTheme } from "./DefaultTheme.js";
import { defaultLayout } from "./layouts/default.js";
import { index } from "./partials/index.js";
import { analytics } from "./partials/analytics.js";
import { breadcrumb } from "./partials/breadcrumb.js";
import {
    commentSummary,
    commentTags,
    reflectionFlags,
} from "./partials/comment.js";
import { footer } from "./partials/footer.js";
import { header } from "./partials/header.js";
import { hierarchy } from "./partials/hierarchy.js";
import { buildRefIcons, icons } from "./partials/icon.js";
import { member } from "./partials/member.js";
import { memberDeclaration } from "./partials/member.declaration.js";
import { memberGetterSetter } from "./partials/member.getterSetter.js";
import { memberReference } from "./partials/member.reference.js";
import { memberSignatureBody } from "./partials/member.signature.body.js";
import { memberSignatureTitle } from "./partials/member.signature.title.js";
import { memberSignatures } from "./partials/member.signatures.js";
import { memberSources } from "./partials/member.sources.js";
import { members } from "./partials/members.js";
import { membersGroup } from "./partials/members.group.js";
import {
    sidebar,
    pageSidebar,
    navigation,
    pageNavigation,
    settings,
    sidebarLinks,
} from "./partials/navigation.js";
import { parameter } from "./partials/parameter.js";
import { reflectionPreview } from "./partials/reflectionPreview.js";
import { toolbar } from "./partials/toolbar.js";
import { type } from "./partials/type.js";
import { typeAndParent } from "./partials/typeAndParent.js";
import { typeParameters } from "./partials/typeParameters.js";
import { indexTemplate } from "./templates/index.js";
import { hierarchyTemplate } from "./templates/hierarchy.js";
import { reflectionTemplate } from "./templates/reflection.js";

function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
    return (...r: L) => fn(first, ...r);
}

export class DefaultThemeRenderContext {
    private _refIcons: typeof icons;
    options: Options;
    internationalization: Internationalization;
    i18n: TranslationProxy;

    constructor(
        private theme: DefaultTheme,
        public page: PageEvent<Reflection>,
        options: Options,
    ) {
        this.options = options;
        this.internationalization = theme.application.internationalization;
        this.i18n = this.internationalization.proxy;

        this._refIcons = buildRefIcons(icons, this);
    }

    /**
     * @deprecated Will be removed in 0.26, no longer required.
     */
    iconsCache(): JSX.Element {
        return JSX.createElement(JSX.Fragment, null);
    }

    /**
     * Icons available for use within the page.
     *
     * Note: This creates a reference to icons declared by {@link DefaultTheme.icons},
     * to customize icons, that object must be modified instead.
     */
    get icons(): Readonly<typeof icons> {
        return this._refIcons;
    }

    hook = (name: keyof RendererHooks) =>
        this.theme.owner.hooks.emit(name, this);

    /** Avoid this in favor of urlTo if possible */
    relativeURL = (url: string, cacheBust = false) => {
        const result = this.theme.markedPlugin.getRelativeUrl(url);
        if (cacheBust && this.theme.owner.cacheBust) {
            return result + `?cache=${this.theme.owner.renderStartTime}`;
        }
        return result;
    };

    urlTo = (reflection: Reflection) => {
        return reflection.url ? this.relativeURL(reflection.url) : "";
    };

    markdown = (
        md: readonly CommentDisplayPart[] | NeverIfInternal<string | undefined>,
    ) => {
        if (md instanceof Array) {
            return this.theme.markedPlugin.parseMarkdown(
                Comment.displayPartsToMarkdown(md, this.urlTo),
                this.page,
            );
        }
        return md ? this.theme.markedPlugin.parseMarkdown(md, this.page) : "";
    };

    getNavigation = () => this.theme.getNavigation(this.page.project);

    getReflectionClasses = (refl: DeclarationReflection) =>
        this.theme.getReflectionClasses(refl);

    reflectionTemplate = bind(reflectionTemplate, this);
    indexTemplate = bind(indexTemplate, this);
    hierarchyTemplate = bind(hierarchyTemplate, this);
    defaultLayout = bind(defaultLayout, this);

    /**
     * Rendered just after the description for a reflection.
     * This can be used to render a shortened type display of a reflection that the
     * rest of the page expands on.
     *
     * Note: Will not be called for variables/type aliases, as they are summarized
     * by their type declaration, which is already rendered by {@link DefaultThemeRenderContext.memberDeclaration}
     */
    reflectionPreview = bind(reflectionPreview, this);

    analytics = bind(analytics, this);
    breadcrumb = bind(breadcrumb, this);
    commentSummary = bind(commentSummary, this);
    commentTags = bind(commentTags, this);
    reflectionFlags = bind(reflectionFlags, this);
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
    sidebar = bind(sidebar, this);
    pageSidebar = bind(pageSidebar, this);
    sidebarLinks = bind(sidebarLinks, this);
    settings = bind(settings, this);
    navigation = bind(navigation, this);
    pageNavigation = bind(pageNavigation, this);
    parameter = bind(parameter, this);
    toolbar = bind(toolbar, this);
    type = bind(type, this);
    typeAndParent = bind(typeAndParent, this);
    typeParameters = bind(typeParameters, this);
}
