declare module "*.gh2964" {
    export const data: "string";
}

/** @ignore */
export { data as first } from "test.gh2964";
/** @ignore */
export { data as second } from "test.gh2964";

/** Comment on variable */
const third: "not ignored";
/** @ignore -- does not work as third has a comment */
export { third };

const fourth: "ignored";
/** @ignore -- works as fourth does not have a comment */
export { fourth };
