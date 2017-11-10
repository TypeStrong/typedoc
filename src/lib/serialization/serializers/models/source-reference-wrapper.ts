import { SourceReference } from '../../../models/sources/file';

/**
 * An internal concrete implementation for the [[ SourceReference ]] interface
 * so it can be identified
 */
export class SourceReferenceWrapper {
  constructor(public sourceReference: SourceReference) { }
}
