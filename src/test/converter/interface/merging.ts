export interface Base {
    base: 1;
}

export interface Base2 {
    base2: 2;
}

export interface Child extends Base, Base2 {
    child: 1;
}

// merged!
export interface Child extends Base {
    child3: 2;
}

export interface Child2 extends Child, Base {
    child2: 1;
}
