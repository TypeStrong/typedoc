import * as ts from 'typescript';

import { Reflection, ReflectionKind } from './abstract';
import { ContainerReflection } from './container';
import { DeclarationReflection } from './declaration';

/**
 * A reflection that represents an export declaration. These are meant to be temporary during conversion and never sent out
 * for rendering.
 *
 * **DO NOT DEFINE A SERIALIZER FOR THIS CLASS.**
 */
export class ExportDeclarationReflection extends DeclarationReflection {
    /** The TS Node that holds the export declaration. */
    exportDeclaration: ts.ExportDeclaration;

    constructor(node: ts.ExportDeclaration, parent: Reflection) {
        super('__export', ReflectionKind.ExportDeclaration, parent);
        this.exportDeclaration = node;

        const container = <ContainerReflection> parent;
        const children = container.children = container.children || [];
        children.push(this);
    }

    /**
     * Throws an error. `ExportDeclarationReflection` objects are meant to be resolved into plain
     * declarations during conversion. So trying to serialize an `ExportDeclarationReflection` indicates an
     * object was misssed and an error.
     *
     * @deprecated Use serializers instead
     */
    toObject(): any {
        throw new Error('ExportDeclarationReflection are temporary objects that should not be used in rendering');
    }

}
