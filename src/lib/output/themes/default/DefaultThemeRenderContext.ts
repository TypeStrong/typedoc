import type { PageEvent, RendererHooks } from "../..";
import {
    Comment,
    CommentDisplayPart,
    DeclarationReflection,
    Reflection,
} from "../../../models";
import type { JSX, NeverIfInternal, Options } from "../../../utils";
import type { DefaultTheme } from "./DefaultTheme";
import { defaultLayout } from "./layouts/default";
import { index } from "./partials";
import { analytics } from "./partials/analytics";
import { breadcrumb } from "./partials/breadcrumb";
import {
    commentSummary,
    commentTags,
    reflectionFlags,
} from "./partials/comment";
import { footer } from "./partials/footer";
import { header } from "./partials/header";
import { hierarchy } from "./partials/hierarchy";
import { buildRefIcons, icons } from "./partials/icon";
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
    sidebar,
    pageSidebar,
    navigation,
    pageNavigation,
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
    private _iconsCache: JSX.Element;
    private _refIcons: typeof icons;
    options: Options;

    constructor(
        private theme: DefaultTheme,
        public page: PageEvent<Reflection>,
        options: Options,
    ) {
        this.options = options;

        const { refs, cache } = buildRefIcons(icons);
        this._refIcons = refs;
        this._iconsCache = cache;
    }

    iconsCache(): JSX.Element {
        return this._iconsCache;
    }

    get icons(): Readonly<typeof icons> {
        return this._refIcons;
    }
    set icons(value: Readonly<typeof icons>) {
        const { refs, cache } = buildRefIcons(value);
        this._refIcons = refs;
        this._iconsCache = cache;
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
    defaultLayout = bind(defaultLayout, this);

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
