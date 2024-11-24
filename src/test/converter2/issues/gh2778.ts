declare module "common" {
    export class Base {}
}
declare module "foo/bar1" {
    import { Base } from "common";
    export class Bar1 extends Base {}
}
declare module "foo/bar2" {
    import { Base } from "common";
    export class Bar2 extends Base {}
}
