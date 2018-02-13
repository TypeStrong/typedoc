import * as ts from 'typescript';
import { ReflectionKind, SignatureReflection } from '../../models/index';
import { Context } from '../context';
export declare function createSignature(context: Context, node: ts.SignatureDeclaration, name: string, kind: ReflectionKind): SignatureReflection;
