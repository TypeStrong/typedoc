import type { PageEvent, Renderer } from "../../index.js";
import type {
    Internationalization,
    TranslationProxy,
} from "../../../internationalization/internationalization.js";
import type {
    DocumentReflection,
    CommentDisplayPart,
    DeclarationReflection,
    Reflection,
} from "../../../models/index.js";
import { type NeverIfInternal, type Options } from "../../../utils/index.js";
import type { DefaultTheme } from "./DefaultTheme.js";
import { defaultLayout } from "./layouts/default.js";
import { index } from "./partials/index.js";
import { breadcrumb } from "./partials/breadcrumb.js";
import {
    commentShortSummary,
    commentSummary,
    commentTags,
    reflectionFlags,
    renderDisplayParts,
} from "./partials/comment.js";
import { footer } from "./partials/footer.js";
import { header } from "./partials/header.js";
import { hierarchy } from "./partials/hierarchy.js";
import { buildRefIcons, type icons } from "./partials/icon.js";
import { member } from "./partials/member.js";
import { memberDeclaration } from "./partials/member.declaration.js";
import { memberGetterSetter } from "./partials/member.getterSetter.js";
import { memberSignatureBody } from "./partials/member.signature.body.js";
import { memberSignatureTitle } from "./partials/member.signature.title.js";
import { memberSignatures } from "./partials/member.signatures.js";
import { memberSources } from "./partials/member.sources.js";
import { members } from "./partials/members.js";
import {
    sidebar,
    pageSidebar,
    navigation,
    pageNavigation,
    settings,
    sidebarLinks,
} from "./partials/navigation.js";
import { reflectionPreview } from "./partials/reflectionPreview.js";
import { toolbar } from "./partials/toolbar.js";
import { type } from "./partials/type.js";
import { typeAndParent } from "./partials/typeAndParent.js";
import { typeParameters } from "./partials/typeParameters.js";
import { indexTemplate } from "./templates/index.js";
import { documentTemplate } from "./templates/document.js";
import { hierarchyTemplate } from "./templates/hierarchy.js";
import { reflectionTemplate } from "./templates/reflection.js";
import {
    typeDeclaration,
    typeDetails,
    typeDetailsIfUseful,
} from "./partials/typeDetails.js";
import {
    moduleMemberSummary,
    moduleReflection,
} from "./partials/moduleReflection.js";

function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
    return (...r: L) => fn(first, ...r);
}

export class DefaultThemeRenderContext {
    private _refIcons: typeof icons;
    options: Options;
    internationalization: Internationalization;
    i18n: TranslationProxy;

    constructor(
        readonly theme: DefaultTheme,
        public page: PageEvent<Reflection>,
        options: Options,
    ) {
        this.options = options;
        this.internationalization = theme.application.internationalization;
        this.i18n = this.internationalization.proxy;
        this._refIcons = buildRefIcons(theme.icons, this);
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

    get slugger() {
        return this.theme.getSlugger(this.page.model);
    }

    hook: Renderer["hooks"]["emit"] = (...params) => {
        return this.theme.owner.hooks.emit(...params);
    };

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
        return this.theme.markedPlugin.parseMarkdown(md || "", this.page, this);
    };

    /** Renders user comment markdown wrapped in a tsd-comment div */
    displayParts = bind(renderDisplayParts, this);

    getNavigation = () => this.theme.getNavigation(this.page.project);

    getReflectionClasses = (refl: DeclarationReflection | DocumentReflection) =>
        this.theme.getReflectionClasses(refl);

    documentTemplate = bind(documentTemplate, this);
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

    /**
     * Used to render additional details about a type. This is used to implement
     * the `@expand` tag, comments on union members, comments on object type members...
     */
    typeDetails = bind(typeDetails, this);

    /**
     * Should call the {@link typeDetails} helper if rendering additional details
     * about the type will provide the user with more information about the type.
     */
    typeDetailsIfUseful = bind(typeDetailsIfUseful, this);

    /**
     * Wrapper around {@link typeDetails} which checks if it is useful
     * and includes a "Type Declaration" header.
     */
    typeDeclaration = bind(typeDeclaration, this);

    breadcrumb = bind(breadcrumb, this);
    commentShortSummary = bind(commentShortSummary, this);
    commentSummary = bind(commentSummary, this);
    commentTags = bind(commentTags, this);
    reflectionFlags = bind(reflectionFlags, this);
    footer = bind(footer, this);
    header = bind(header, this);
    hierarchy = bind(hierarchy, this);
    index = bind(index, this);
    member = bind(member, this);
    moduleReflection = bind(moduleReflection, this);
    moduleMemberSummary = bind(moduleMemberSummary, this);
    memberDeclaration = bind(memberDeclaration, this);
    memberGetterSetter = bind(memberGetterSetter, this);
    memberSignatureBody = bind(memberSignatureBody, this);
    memberSignatureTitle = bind(memberSignatureTitle, this);
    memberSignatures = bind(memberSignatures, this);
    memberSources = bind(memberSources, this);
    members = bind(members, this);
    sidebar = bind(sidebar, this);
    pageSidebar = bind(pageSidebar, this);
    sidebarLinks = bind(sidebarLinks, this);
    settings = bind(settings, this);
    navigation = bind(navigation, this);
    pageNavigation = bind(pageNavigation, this);
    toolbar = bind(toolbar, this);
    type = bind(type, this);
    typeAndParent = bind(typeAndParent, this);
    typeParameters = bind(typeParameters, this);
}
