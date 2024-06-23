import * as Int from "./int.js";

type Int = typeof Int;

export interface FileInt extends Int {}

export class FileClass {}
export interface FileClass extends Int {}
