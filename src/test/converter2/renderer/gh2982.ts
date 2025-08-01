export type TMXNode<T> = {} & {
    base: T;
};

export interface TMXDataNode extends TMXNode<{ extra: any }> {
}
