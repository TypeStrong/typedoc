/** abc */
const abc = 123;

/** export abc */
export { abc, abc as abcRef };

/** foo */
namespace foo {
    export const abc = 123;
}

/** export foo */
export { foo };
