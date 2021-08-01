/// <reference lib="dom" />

import { KeysOfType, WritableKeys } from "./general";

export const Fragment = Symbol();

/**
 * Used to inject HTML directly into the document.
 */
export function Raw(_props: { html: string }) {
    // This is handled specially by the renderElement function. Instead of being
    // called, the tag is compared to this function and the `html` prop will be
    // returned directly.
    return null;
}

export type Children = Element | string | null | undefined | Children[];

export type Component<P> = (props: P) => Element | null | undefined;

// Setting these doesn't make sense.
type BannedElementKeys =
    | "dataset"
    | "innerHTML" // use Raw
    | "outerHTML"
    | "innerHTML"
    | "innerText"
    | "textContent";
// This should come back at some point.
// | "style";

interface RemapKeys {
    className: "class";
    htmlFor: "for";
    httpEquiv: "http-equiv";
}

type ElementKeys<T> = Exclude<
    WritableKeys<T>,
    BannedElementKeys | KeysOfType<T, Function>
>;

type BasicHtmlElements = {
    [K in keyof HTMLElementTagNameMap]: {
        [K2 in ElementKeys<
            HTMLElementTagNameMap[K]
        > as K2 extends keyof RemapKeys
            ? RemapKeys[K2]
            : K2]?: K2 extends "children"
            ? Children
            : HTMLElementTagNameMap[K][K2];
    } & {
        style?: string; // This should go away.
    } & (K extends "meta" ? { charSet?: string } : unknown);
};

export interface IntrinsicElements extends BasicHtmlElements {}

export interface Element {
    tag: typeof Fragment | keyof IntrinsicElements | Component<any>;
    props: object | null;
    children: Children[];
}
