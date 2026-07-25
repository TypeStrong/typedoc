/** @internal */
export interface Host {
    adjust(at: number, count: number): void;
}

export class Manager implements Host {
    adjust(at: number, count: number): void {
        void at;
        void count;
    }
}

/** @hidden */
export interface HiddenHost {
    grow(by: number): void;
}

export class HiddenManager implements HiddenHost {
    grow(by: number): void {
        void by;
    }
}
