import type { RendererHooks } from "../..";
import {
    DeclarationReflection,
    ReferenceType,
    Reflection,
    ReflectionKind,
} from "../../../models";
import type { Options } from "../../../utils";
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

    markdown = (md: string | undefined) => {
        return md ? this.theme.markedPlugin.parseMarkdown(md) : "";
    };

    attemptExternalResolution = (type: ReferenceType) => {
        return this.theme.owner.attemptExternalResolution(type);
    };

    getReflectionClasses = (reflection: DeclarationReflection) => {
        const filters = this.options.getValue("visibilityFilters") as Record<
            string,
            boolean
        >;
        return getReflectionClasses(reflection, filters);
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
    settings = bind(settings, this);
    primaryNavigation = bind(primaryNavigation, this);
    secondaryNavigation = bind(secondaryNavigation, this);
    parameter = bind(parameter, this);
    toolbar = bind(toolbar, this);
    type = bind(type, this);
    typeAndParent = bind(typeAndParent, this);
    typeParameters = bind(typeParameters, this);
}

function getReflectionClasses(
    reflection: DeclarationReflection,
    filters: Record<string, boolean>
) {
    const classes: string[] = [];

    classes.push(toStyleClass("tsd-kind-" + ReflectionKind[reflection.kind]));

    if (
        reflection.parent &&
        reflection.parent instanceof DeclarationReflection
    ) {
        classes.push(
            toStyleClass(
                `tsd-parent-kind-${ReflectionKind[reflection.parent.kind]}`
            )
        );
    }

    // Filter classes should match up with the settings function in
    // partials/navigation.tsx.
    for (const key of Object.keys(filters)) {
        if (key === "inherited") {
            if (reflection.inheritedFrom) {
                classes.push("tsd-is-inherited");
            }
        } else if (key === "protected") {
            if (reflection.flags.isProtected) {
                classes.push("tsd-is-protected");
            }
        } else if (key === "private") {
            if (reflection.flags.isPrivate) {
                classes.push("tsd-is-private");
            }
        } else if (key === "external") {
            if (reflection.flags.isExternal) {
                classes.push("tsd-is-external");
            }
        } else if (key.startsWith("@")) {
            if (key === "@deprecated") {
                if (reflection.isDeprecated()) {
                    classes.push(toStyleClass(`tsd-is-${key.substring(1)}`));
                }
            } else if (
                reflection.comment?.hasModifier(key as `@${string}`) ||
                reflection.comment?.getTag(key as `@${string}`)
            ) {
                classes.push(toStyleClass(`tsd-is-${key.substring(1)}`));
            }
        }
    }

    return classes.join(" ");
}

function toStyleClass(str: string) {
    return str
        .replace(/(\w)([A-Z])/g, (_m, m1, m2) => m1 + "-" + m2)
        .toLowerCase();
}
