import { Lexer, Slugger } from "marked";

/**
 * Testing custom external link resolution
 * {@link !Promise}
 */
export type P = Promise<string>;

export const L = new Lexer();
export const S = new Slugger();
