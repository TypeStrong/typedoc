import assert from "assert";
import { ReflectionKind } from "../../../../models";
import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

const kindIcon = (letterPath: JSX.Element, color: string, circular = false) => (
    <svg class="tsd-kind-icon" viewBox="0 0 24 24">
        <rect
            fill="var(--color-icon-background)"
            stroke={color}
            stroke-width="1.5"
            x="1"
            y="1"
            width="22"
            height="22"
            rx={circular ? "12" : "6"}
        />
        {letterPath}
    </svg>
);

const textIcon = (letter: string, color: string, circular = false) =>
    kindIcon(
        <text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">
            {letter}
        </text>,
        color,
        circular,
    );

export function buildRefIcons<T extends Record<string, () => JSX.Element>>(
    icons: T,
    context: DefaultThemeRenderContext,
): T {
    const refs: Record<string, () => JSX.Element> = {};

    for (const [name, builder] of Object.entries(icons)) {
        const jsx = builder.call(icons);
        assert(jsx.tag === "svg", "TypeDoc's frontend assumes that icons are written as svg elements");
        // This one cannot be cached because the CSS selector depends on targeting SVG elements
        // within it. Ick. Surely there's a nicer way?
        if (name === "checkbox") {
            refs[name] = () => jsx;
            continue;
        }

        const ref = (
            <svg {...jsx.props} id={undefined}>
                <use href={`${context.relativeURL("assets/icons.svg")}#icon-${name}`} />
            </svg>
        );
        refs[name] = () => ref;
    }

    return refs as T;
}

export const icons: Record<
    ReflectionKind | "chevronDown" | "checkbox" | "menu" | "search" | "chevronSmall" | "anchor" | "folder",
    () => JSX.Element
> = {
    [ReflectionKind.Accessor]: () => textIcon("A", "var(--color-ts-accessor)", true),
    [ReflectionKind.CallSignature]() {
        return this[ReflectionKind.Function]();
    },
    [ReflectionKind.Class]: () => textIcon("C", "var(--color-ts-class)"),
    [ReflectionKind.Constructor]: () => textIcon("C", "var(--color-ts-constructor)", true),
    [ReflectionKind.ConstructorSignature]() {
        return this[ReflectionKind.Constructor]();
    },
    [ReflectionKind.Enum]: () => textIcon("E", "var(--color-ts-enum)"),
    [ReflectionKind.EnumMember]() {
        return this[ReflectionKind.Property]();
    },
    [ReflectionKind.Function]: () => textIcon("F", "var(--color-ts-function)"),
    [ReflectionKind.GetSignature]() {
        return this[ReflectionKind.Accessor]();
    },
    [ReflectionKind.IndexSignature]() {
        return this[ReflectionKind.Property]();
    },
    [ReflectionKind.Interface]: () => textIcon("I", "var(--color-ts-interface)"),
    [ReflectionKind.Method]: () => textIcon("M", "var(--color-ts-method)", true),
    [ReflectionKind.Module]: () => textIcon("M", "var(--color-ts-module)"),
    [ReflectionKind.Namespace]: () => textIcon("N", "var(--color-ts-namespace)"),
    [ReflectionKind.Parameter]() {
        return this[ReflectionKind.Property]();
    },
    [ReflectionKind.Project]() {
        return this[ReflectionKind.Module]();
    },
    [ReflectionKind.Property]: () => textIcon("P", "var(--color-ts-property)", true),
    [ReflectionKind.Reference]: () => textIcon("R", "var(--color-ts-reference)", true),
    [ReflectionKind.SetSignature]() {
        return this[ReflectionKind.Accessor]();
    },
    [ReflectionKind.TypeAlias]: () => textIcon("T", "var(--color-ts-type-alias)"),
    [ReflectionKind.TypeLiteral]() {
        return this[ReflectionKind.TypeAlias]();
    },
    [ReflectionKind.TypeParameter]() {
        return this[ReflectionKind.TypeAlias]();
    },
    [ReflectionKind.Variable]: () => textIcon("V", "var(--color-ts-variable)"),
    [ReflectionKind.Document]: () =>
        kindIcon(
            <g stroke="var(--color-icon-text)" fill="none" stroke-width="1.5">
                <polygon points="6,5 6,19 18,19, 18,10 13,5" />
                <line x1="9" y1="9" x2="13" y2="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
            </g>,
            "var(--color-document)",
        ),
    folder: () =>
        kindIcon(
            <g stroke="var(--color-icon-text)" fill="none" stroke-width="1.5">
                <polygon points="5,5 10,5 12,8 19,8 19,18 5,18" />
            </g>,
            "var(--color-document)",
        ),
    chevronDown: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M4.93896 8.531L12 15.591L19.061 8.531L16.939 6.409L12 11.349L7.06098 6.409L4.93896 8.531Z"
                fill="var(--color-icon-text)"
            />
        </svg>
    ),
    chevronSmall: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M1.5 5.50969L8 11.6609L14.5 5.50969L12.5466 3.66086L8 7.96494L3.45341 3.66086L1.5 5.50969Z"
                fill="var(--color-icon-text)"
            />
        </svg>
    ),
    checkbox: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect class="tsd-checkbox-background" width="30" height="30" x="1" y="1" rx="6" fill="none" />
            <path
                class="tsd-checkbox-checkmark"
                d="M8.35422 16.8214L13.2143 21.75L24.6458 10.25"
                stroke="none"
                stroke-width="3.5"
                stroke-linejoin="round"
                fill="none"
            />
        </svg>
    ),
    menu: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {["3", "7", "11"].map((y) => (
                <rect x="1" y={y} width="14" height="2" fill="var(--color-icon-text)" />
            ))}
        </svg>
    ),
    search: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M15.7824 13.833L12.6666 10.7177C12.5259 10.5771 12.3353 10.499 12.1353 10.499H11.6259C12.4884 9.39596 13.001 8.00859 13.001 6.49937C13.001 2.90909 10.0914 0 6.50048 0C2.90959 0 0 2.90909 0 6.49937C0 10.0896 2.90959 12.9987 6.50048 12.9987C8.00996 12.9987 9.39756 12.4863 10.5008 11.6239V12.1332C10.5008 12.3332 10.5789 12.5238 10.7195 12.6644L13.8354 15.7797C14.1292 16.0734 14.6042 16.0734 14.8948 15.7797L15.7793 14.8954C16.0731 14.6017 16.0731 14.1267 15.7824 13.833ZM6.50048 10.499C4.29094 10.499 2.50018 8.71165 2.50018 6.49937C2.50018 4.29021 4.28781 2.49976 6.50048 2.49976C8.71001 2.49976 10.5008 4.28708 10.5008 6.49937C10.5008 8.70852 8.71314 10.499 6.50048 10.499Z"
                fill="var(--color-icon-text)"
            />
        </svg>
    ),
    anchor: () => (
        <svg viewBox="0 0 24 24">
            <g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
                <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
            </g>
        </svg>
    ),
};
