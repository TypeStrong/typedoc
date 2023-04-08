import * as Int from "./int";

type Int = typeof Int;

export interface FileInt extends Int {}

export class FileClass {}
export interface FileClass extends Int {}
