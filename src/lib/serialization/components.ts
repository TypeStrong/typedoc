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
 *
 * [[Serializer]] will compare the function referenced in `serializeGroup` for each serializer
 * component instance, this is why, when extending [[SerializerComponent]], it is recommended to
 * reference `serializeGroup` to an existing function instead of creating a new function on for
 * every new plugin. This will ensure maximum performance.
 * > It is also possible to set a get accessor in the prototype to return the same function.
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
   *  serializeGroup = instance => instance instanceof Reflection ? Reflection : undefined;
   *  serializeGroupSymbol = Reflection;
   * }
   * ```
   *
   * Use the [[Type]] class to group all type based serializers:
   * ```typescript
   * class TypeSerializer {
   *  serializeGroup = instance => instance instanceof Type ? Type : undefined;
   *  serializeGroupSymbol = Type;
   * }
   * ```
   *
   * > When a serializer component extends a parent serializer component the SERIALIZE_GROUP
   * and SERIALIZE_GROUP_SYMBOL are also inherited so child serializers of the same group does not
   * need to declare a predicate nor a group.
   */
  abstract serializeGroup: (instance: boolean) => boolean;
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

  supports: (item: T) => boolean;

  abstract toObject(item: T, obj?: any): any;

}

export abstract class ReflectionSerializerComponent<T extends Reflection> extends SerializerComponent<T> {

  /**
   * Filter for instances of [[Reflection]]
   */
  protected static serializeGroup(instance: any): boolean {
    return instance instanceof Reflection;
  }

  // use same fn for every instance
  serializeGroup = ReflectionSerializerComponent.serializeGroup;
  serializeGroupSymbol = Reflection;

  supports: (reflection: T) => boolean;

  abstract toObject(reflection: T, obj?: any): any;
}

export abstract class TypeSerializerComponent<T extends Type> extends SerializerComponent<T> {

  /**
   * Filter for instances of [[Type]]
   */
  protected static serializeGroup(instance: any): boolean {
    return instance instanceof Type;
  }

  // use same fn for every instance
  serializeGroup = TypeSerializerComponent.serializeGroup;
  serializeGroupSymbol = Type;

  supports: (type: T) => boolean;

  abstract toObject(type: T, obj?: any): any;
}
