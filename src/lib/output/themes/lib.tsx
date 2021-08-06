import { ok as assert } from "assert";
import { DeclarationReflection, Reflection, ReflectionFlags, TypeParameterContainer } from "../../models";
import { createElement, JSX } from "../../utils";

export function stringify(data: unknown) {
    if (typeof data === "bigint") {
        return data.toString() + "n";
    }
    return JSON.stringify(data);
}

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(str: string): (string | JSX.Element)[] {
    // TODO surely there is a better way to do this, but I'm tired.
    const ret: (string | JSX.Element)[] = [];
    const re = /[\s\S]*?(?:([^_-][_-])(?=[^_-])|([^A-Z])(?=[A-Z][^A-Z]))/g;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(str))) {
        ret.push(match[0]);
        ret.push(<wbr />);
        i += match[0].length;
    }
    ret.push(str.slice(i));

    return ret;
}

export function join<T>(joiner: JSX.Children, list: readonly T[], cb: (x: T) => JSX.Children) {
    const result: JSX.Children = [];

    for (const item of list) {
        if (result.length > 0) {
            result.push(joiner);
        }
        result.push(cb(item));
    }

    return <>{result}</>;
}

export function renderFlags(flags: ReflectionFlags) {
    return (
        <>
            {flags.map((item) => (
                <>
                    <span class={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                </>
            ))}
        </>
    );
}

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names)
        .filter(([, include]) => include)
        .map(([key]) => key)
        .join(" ");
}

export function assertIsDeclarationReflection(reflection: Reflection): DeclarationReflection {
    assert(reflection instanceof DeclarationReflection);
    return reflection;
}

export function hasTypeParameters(reflection: Reflection): reflection is Reflection & {
    typeParameters: Exclude<TypeParameterContainer["typeParameters"], undefined>;
} {
    return (reflection as TypeParameterContainer).typeParameters != null;
}
