export interface Other {}
export declare function m<Content>(content: Content): Content extends object ? Content : Other;
