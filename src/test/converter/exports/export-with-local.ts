export const x = 5;

// This will not show up in the generated docs
let localVar = 0;

export function add(x: number, y: number) {
    return x + y + localVar;
}
