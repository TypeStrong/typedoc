/** The FOO function */
function foo() {
    return "foo";
}

function bugInner(): { foo: string } {
    return { foo: "bar" };
}

export const bug: {
    (): { foo: string };
    foo: typeof foo;
    bar: 42;
} = Object.assign(bugInner, {
    foo,
    bar: 42 as const,
});
