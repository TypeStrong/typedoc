import { Comment } from "../comments/comment";
import { splitUnquotedString } from "./utils";
import type { ProjectReflection } from "./project";
import type { NeverIfInternal } from "../../utils";
import { ReflectionKind } from "./kind";
import type { Serializer, Deserializer, JSONOutput } from "../../serialization";
import type { ReflectionVariant } from "./variant";
import type { DeclarationReflection } from "./declaration";
import type { DocumentReflection } from "./document";
import { NonEnumerable } from "../../utils/general";
import type {
    Internationalization,
    TranslatedString,
} from "../../internationalization";

/**
 * Current reflection id.
 */
let REFLECTION_ID = 0;

/**
 * Reset the reflection id.
 *
 * Used by the test cases to ensure the reflection ids won't change between runs.
 */
export function resetReflectionID() {
    REFLECTION_ID = 0;
}

export enum ReflectionFlag {
    None = 0,
    Private = 1 << 0,
    Protected = 1 << 1,
    Public = 1 << 2,
    Static = 1 << 3,
    External = 1 << 4,
    Optional = 1 << 5,
    Rest = 1 << 6,
    Abstract = 1 << 7,
    Const = 1 << 8,
    Readonly = 1 << 9,
    Inherited = 1 << 10,
}

const relevantFlags: ReflectionFlag[] = [
    ReflectionFlag.Private,
    ReflectionFlag.Protected,
    ReflectionFlag.Static,
    ReflectionFlag.Optional,
    ReflectionFlag.Rest,
    ReflectionFlag.Abstract,
    ReflectionFlag.Const,
    ReflectionFlag.Readonly,
];

/**
 * This must extend Array in order to work with Handlebar's each helper.
 */
export class ReflectionFlags {
    private flags = ReflectionFlag.None;

    hasFlag(flag: ReflectionFlag) {
        return (flag & this.flags) !== 0;
    }

    /**
     * Is this a private member?
     */
    get isPrivate(): boolean {
        return this.hasFlag(ReflectionFlag.Private);
    }

    /**
     * Is this a protected member?
     */
    get isProtected(): boolean {
        return this.hasFlag(ReflectionFlag.Protected);
    }

    /**
     * Is this a public member?
     */
    get isPublic(): boolean {
        return this.hasFlag(ReflectionFlag.Public);
    }

    /**
     * Is this a static member?
     */
    get isStatic(): boolean {
        return this.hasFlag(ReflectionFlag.Static);
    }

    /**
     * Is this a declaration from an external document?
     */
    get isExternal(): boolean {
        return this.hasFlag(ReflectionFlag.External);
    }

    /**
     * Whether this reflection is an optional component or not.
     *
     * Applies to function parameters and object members.
     */
    get isOptional(): boolean {
        return this.hasFlag(ReflectionFlag.Optional);
    }

    /**
     * Whether it's a rest parameter, like `foo(...params);`.
     */
    get isRest(): boolean {
        return this.hasFlag(ReflectionFlag.Rest);
    }

    get isAbstract(): boolean {
        return this.hasFlag(ReflectionFlag.Abstract);
    }

    get isConst() {
        return this.hasFlag(ReflectionFlag.Const);
    }

    get isReadonly() {
        return this.hasFlag(ReflectionFlag.Readonly);
    }

    get isInherited() {
        return this.hasFlag(ReflectionFlag.Inherited);
    }

    setFlag(flag: ReflectionFlag, set: boolean) {
        switch (flag) {
            case ReflectionFlag.Private:
                this.setSingleFlag(ReflectionFlag.Private, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Protected, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Protected:
                this.setSingleFlag(ReflectionFlag.Protected, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Public, false);
                }
                break;
            case ReflectionFlag.Public:
                this.setSingleFlag(ReflectionFlag.Public, set);
                if (set) {
                    this.setFlag(ReflectionFlag.Private, false);
                    this.setFlag(ReflectionFlag.Protected, false);
                }
                break;
            default:
                this.setSingleFlag(flag, set);
        }
    }

    getFlagStrings(i18n: Internationalization) {
        const strings: TranslatedString[] = [];
        for (const flag of relevantFlags) {
            if (this.hasFlag(flag)) {
                strings.push(i18n.flagString(flag));
            }
        }
        return strings;
    }

    private setSingleFlag(flag: ReflectionFlag, set: boolean) {
        if (!set && this.hasFlag(flag)) {
            this.flags ^= flag;
        } else if (set && !this.hasFlag(flag)) {
            this.flags |= flag;
        }
    }

    private static serializedFlags = [
        "isPrivate",
        "isProtected",
        "isPublic",
        "isStatic",
        "isExternal",
        "isOptional",
        "isRest",
        "isAbstract",
        "isConst",
        "isReadonly",
        "isInherited",
    ] as const;

    toObject(): JSONOutput.ReflectionFlags {
        return Object.fromEntries(
            ReflectionFlags.serializedFlags
                .filter((flag) => this[flag])
                .map((flag) => [flag, true]),
        );
    }

    fromObject(obj: JSONOutput.ReflectionFlags) {
        for (const key of Object.keys(obj)) {
            const flagName = key.substring(2); // isPublic => Public
            if (flagName in ReflectionFlag) {
                this.setFlag(
                    ReflectionFlag[flagName as keyof typeof ReflectionFlag],
                    true,
                );
            }
        }
    }
}

export enum TraverseProperty {
    Children,
    Documents,
    Parameters,
    TypeLiteral,
    TypeParameter,
    Signatures,
    IndexSignature,
    GetSignature,
    SetSignature,
}

export interface TraverseCallback {
    /**
     * May return false to bail out of any further iteration. To preserve backwards compatibility, if
     * a function returns undefined, iteration must continue.
     */
    (
        reflection: Reflection,
        property: TraverseProperty,
    ): boolean | NeverIfInternal<void>;
}

export type ReflectionVisitor = {
    [K in keyof ReflectionVariant]?: (refl: ReflectionVariant[K]) => void;
};

/**
 * Base class for all reflection classes.
 *
 * While generating a documentation, TypeDoc generates an instance of {@link ProjectReflection}
 * as the root for all reflections within the project. All other reflections are represented
 * by the {@link DeclarationReflection} class.
 *
 * This base class exposes the basic properties one may use to traverse the reflection tree.
 * You can use the {@link ContainerReflection.children} and {@link parent} properties to walk the tree. The {@link ContainerReflection.groups} property
 * contains a list of all children grouped and sorted for rendering.
 * @category Reflections
 */
export abstract class Reflection {
    /**
     * Discriminator representing the type of reflection represented by this object.
     */
    abstract readonly variant: keyof ReflectionVariant;

    /**
     * Unique id of this reflection.
     */
    id: number;

    /**
     * The symbol name of this reflection.
     */
    name: string;

    /**
     * The kind of this reflection.
     */
    kind: ReflectionKind;

    flags: ReflectionFlags = new ReflectionFlags();

    /**
     * The reflection this reflection is a child of.
     */
    @NonEnumerable // So that it doesn't show up in console.log
    parent?: Reflection;

    @NonEnumerable
    project: ProjectReflection;

    /**
     * The parsed documentation comment attached to this reflection.
     */
    comment?: Comment;

    /**
     * The url of this reflection in the generated documentation.
     * TODO: Reflections shouldn't know urls exist. Move this to a serializer.
     */
    url?: string;

    /**
     * The name of the anchor of this child.
     * TODO: Reflections shouldn't know anchors exist. Move this to a serializer.
     */
    anchor?: string;

    /**
     * Is the url pointing to an individual document?
     *
     * When FALSE, the url points to an anchor tag on a page of a different reflection.
     * TODO: Reflections shouldn't know how they are rendered. Move this to the correct serializer.
     */
    hasOwnDocument?: boolean;

    /**
     * Url safe alias for this reflection.
     */
    private _alias?: string;

    private _aliases?: Map<string, number>;

    constructor(name: string, kind: ReflectionKind, parent?: Reflection) {
        this.id = REFLECTION_ID++;
        this.parent = parent;
        this.project = parent?.project || (this as any as ProjectReflection);
        this.name = name;
        this.kind = kind;

        // If our parent is external, we are too.
        if (parent?.flags.isExternal) {
            this.setFlag(ReflectionFlag.External);
        }
    }

    /**
     * Test whether this reflection is of the given kind.
     */
    kindOf(kind: ReflectionKind | ReflectionKind[]): boolean {
        const kindFlags = Array.isArray(kind)
            ? kind.reduce((a, b) => a | b, 0)
            : kind;
        return (this.kind & kindFlags) !== 0;
    }

    /**
     * Return the full name of this reflection. Intended for use in debugging. For log messages
     * intended to be displayed to the user for them to fix, prefer {@link getFriendlyFullName} instead.
     *
     * The full name contains the name of this reflection and the names of all parent reflections.
     *
     * @param separator  Separator used to join the names of the reflections.
     * @returns The full name of this reflection.
     */
    getFullName(separator = "."): string {
        if (this.parent && !this.parent.isProject()) {
            return this.parent.getFullName(separator) + separator + this.name;
        } else {
            return this.name;
        }
    }

    /**
     * Return the full name of this reflection, with signature names dropped if possible without
     * introducing ambiguity in the name.
     */
    getFriendlyFullName(): string {
        if (this.parent && !this.parent.isProject()) {
            if (
                this.kindOf(
                    ReflectionKind.ConstructorSignature |
                        ReflectionKind.CallSignature |
                        ReflectionKind.GetSignature |
                        ReflectionKind.SetSignature,
                )
            ) {
                return this.parent.getFriendlyFullName();
            }

            return this.parent.getFriendlyFullName() + "." + this.name;
        } else {
            return this.name;
        }
    }

    /**
     * Set a flag on this reflection.
     */
    setFlag(flag: ReflectionFlag, value = true) {
        this.flags.setFlag(flag, value);
    }

    /**
     * Return an url safe alias for this reflection.
     */
    getAlias(): string {
        this._alias ||= this.getUniqueAliasInPage(
            this.name.replace(/\W/g, "_") || `reflection-${this.id}`,
        );

        return this._alias;
    }

    // This really ought not live here, it ought to live in the html renderer, but moving that
    // is more work than I want right now, it can wait for 0.27 when trying to split models into
    // a bundleable structure.
    getUniqueAliasInPage(heading: string) {
        // NTFS/ExFAT use uppercase, so we will too. It probably won't matter
        // in this case since names will generally be valid identifiers, but to be safe...
        const upperAlias = heading.toUpperCase();

        let target = this as Reflection;
        while (target.parent && !target.hasOwnDocument) {
            target = target.parent;
        }

        target._aliases ||= new Map();

        let suffix = "";
        if (!target._aliases.has(upperAlias)) {
            target._aliases.set(upperAlias, 1);
        } else {
            const count = target._aliases.get(upperAlias)!;
            suffix = "-" + count.toString();
            target._aliases.set(upperAlias, count + 1);
        }

        heading += suffix;
        return heading;
    }

    /**
     * Has this reflection a visible comment?
     *
     * @returns TRUE when this reflection has a visible comment.
     */
    hasComment(): boolean {
        return this.comment ? this.comment.hasVisibleComponent() : false;
    }

    hasGetterOrSetter(): boolean {
        return false;
    }

    /**
     * Return a child by its name.
     *
     * @param arg The name hierarchy of the child to look for.
     * @returns The found child or undefined.
     */
    getChildByName(arg: string | string[]): Reflection | undefined {
        const names: string[] = Array.isArray(arg)
            ? arg
            : splitUnquotedString(arg, ".");
        const name = names[0];
        let result: Reflection | undefined;

        this.traverse((child) => {
            if (child.name === name) {
                if (names.length <= 1) {
                    result = child;
                } else {
                    result = child.getChildByName(names.slice(1));
                }
                return false;
            }
            return true;
        });

        return result;
    }

    /**
     * Return whether this reflection is the root / project reflection.
     */
    isProject(): this is ProjectReflection {
        return false;
    }
    isDeclaration(): this is DeclarationReflection {
        return false;
    }
    isDocument(): this is DocumentReflection {
        return false;
    }

    /**
     * Check if this reflection or any of its parents have been marked with the `@deprecated` tag.
     */
    isDeprecated(): boolean {
        let signaturesDeprecated = false as boolean;
        this.visit({
            declaration(decl) {
                if (
                    decl.signatures?.length &&
                    decl.signatures.every((sig) =>
                        sig.comment?.getTag("@deprecated"),
                    )
                ) {
                    signaturesDeprecated = true;
                }
            },
        });

        if (signaturesDeprecated || this.comment?.getTag("@deprecated")) {
            return true;
        }

        return this.parent?.isDeprecated() ?? false;
    }

    /**
     * Traverse most potential child reflections of this reflection.
     *
     * Note: This may not necessarily traverse child reflections contained within the `type` property
     * of the reflection, and should not be relied on for this. Support for checking object types will likely be removed in v0.27.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    abstract traverse(callback: TraverseCallback): void;

    visit(visitor: ReflectionVisitor) {
        visitor[this.variant]?.(this as never);
    }

    /**
     * Return a string representation of this reflection.
     */
    toString(): string {
        return ReflectionKind[this.kind] + " " + this.name;
    }

    /**
     * Return a string representation of this reflection and all of its children.
     *
     * Note: This is intended as a debug tool only, output may change between patch versions.
     *
     * @param indent  Used internally to indent child reflections.
     */
    toStringHierarchy(indent = "") {
        const lines = [indent + this.toString()];

        indent += "  ";
        this.traverse((child) => {
            lines.push(child.toStringHierarchy(indent));
            return true;
        });

        return lines.join("\n");
    }

    toObject(serializer: Serializer): JSONOutput.Reflection {
        return {
            id: this.id,
            name: this.name,
            variant: this.variant,
            kind: this.kind,
            flags: this.flags.toObject(),
            comment:
                this.comment && !this.comment.isEmpty()
                    ? serializer.toObject(this.comment)
                    : undefined,
        };
    }

    fromObject(de: Deserializer, obj: JSONOutput.Reflection) {
        // DO NOT copy id from obj. When deserializing reflections
        // they should be given new ids since they belong to a different project.
        this.name = obj.name;
        // Skip copying variant, we know it's already the correct value because the deserializer
        // will construct the correct class type.
        this.kind = obj.kind;
        this.flags.fromObject(obj.flags);
        // Parent is set during construction, so we don't need to do it here.
        this.comment = de.revive(obj.comment, () => new Comment());
        // url, anchor, hasOwnDocument, _alias, _aliases are set during rendering and only relevant during render.
        // It doesn't make sense to serialize them to json, or restore them.
    }
}
