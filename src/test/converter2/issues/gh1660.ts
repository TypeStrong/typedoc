declare const m: {
    SomeClass: any;
};

export type SomeType = typeof m.SomeClass.someProp;
