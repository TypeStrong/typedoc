import { Reflection, Type } from '../models';
import { AbstractComponent } from '../utils';

import { Serializer } from './serializer';

/**
 * Represents Serializer plugin component.
 *
 * Like [[Converter]] plugins each [[Serializer]] plugin defines a predicate that instructs if an
 * object can be serialized by it, this is done dynamically at runtime via a `supports` method.
 *
 * Additionally, each [[Serializer]] plugin must defines a predicate that instructs the group
 * it belongs to.
 *
 * Grouping serializers is required due to performance, we don't need to check all the reflection
 * serializers when we are looking for type (or any other) serializers.
 */
export abstract class SerializerComponent<T> extends AbstractComponent<Serializer> {

  /**
   * The priority this serializer should be executed with.
   * A higher priority means the [[Serializer]] will be applied earlier.
   */
  static PRIORITY = 0;

  /**
   * A high-level predicate filtering which group this serializer belongs to.
   * This is a high-level filter before the [[SerializerComponent.supports]] predicate filter.
   *
   * When the filter returns true the group identifier is taken from
   * [[SerializerComponentType.serializeGroupSymbol]].
   *
   * For example, use the [[Reflection]] class class to group all reflection based serializers:
   * ```typescript
   * class ReflectionSerializer {
   *  serializeGroup(instance) { return instance instanceof Reflection }
   *  serializeGroupSymbol = Reflection;
   * }
   * ```
   *
   * Use the [[Type]] class to group all type based serializers:
   * ```typescript
   * class TypeSerializer {
   *  serializeGroup(instance) { return instance instanceof Type }
   *  serializeGroupSymbol = Type;
   * }
   * ```
   *
   * > When a serializer component extends a parent serializer component the SERIALIZE_GROUP
   * and SERIALIZE_GROUP_SYMBOL are also inherited so child serializers of the same group do not
   * need to declare a predicate nor a group.
   */
  abstract serializeGroup(instance: unknown): boolean;
  /**
   * The symbol representing the group this serializer belongs to.
   */
  abstract serializeGroupSymbol: any;

  /**
   * The priority this serializer should be executed with.
   * A higher priority means the [[Serializer]] will be applied earlier.
   */
  get priority(): number {
    return this.constructor['PRIORITY'];
  }

  abstract supports(item: unknown): boolean;

  abstract toObject(item: T, obj?: any): any;

}

export abstract class ReflectionSerializerComponent<T extends Reflection> extends SerializerComponent<T> {

  /**
   * Filter for instances of [[Reflection]]
   */
  serializeGroup(instance: unknown): boolean {
    return instance instanceof Reflection;
  }

  serializeGroupSymbol = Reflection;
}

export abstract class TypeSerializerComponent<T extends Type> extends SerializerComponent<T> {

  /**
   * Filter for instances of [[Type]]
   */
  serializeGroup(instance: unknown): boolean {
    return instance instanceof Type;
  }

  serializeGroupSymbol = Type;
}
