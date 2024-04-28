import { multiply } from "./b.js";

export function add(a: number, b: number) {
    return a + multiply(b, 1);
}
