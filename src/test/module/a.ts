import { multiply } from './b';

export function add(a: number, b: number) {
    return a + multiply(b, 1);
}
