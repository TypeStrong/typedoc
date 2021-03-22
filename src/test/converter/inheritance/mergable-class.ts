export interface MyCtor {
    staticProp: 1;
    new (): My;
}

export interface My {
    instanceProp: 1;
}

export declare const My: MyCtor;

export class MySubClass extends My {}
