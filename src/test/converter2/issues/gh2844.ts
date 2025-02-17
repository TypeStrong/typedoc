export {};

declare global {
    namespace globalThis {
        interface URL {
            customMethod(): string;
        }
    }
}
