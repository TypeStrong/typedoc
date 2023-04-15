export interface Int {
    prop: () => string;
    prop2: () => string;
    method(): string;
    method2(): string;
}

export class IntImpl implements Int {
    prop = () => "";
    prop2() {
        return "";
    }
    method = () => "";
    method2() {
        return "";
    }
}
