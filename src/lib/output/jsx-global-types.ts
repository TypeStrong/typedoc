export {};
declare global {
    namespace JSX {
        interface IntrinsicElements {
            mdcontainer: any;
        }
    }
}
declare module "react" {
    interface AnchorHTMLAttributes<T> {
        name?: string | undefined;
    }
}
