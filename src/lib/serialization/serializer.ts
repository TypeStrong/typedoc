import { ChildableComponent } from '../utils';
import { Component, ComponentClass } from '../utils/component';
import { Application } from '../application';
import { ProjectReflection } from '../models';

import { SerializerComponent } from './components';
import { SerializeEvent } from './events';

@Component({name: 'serializer', internal: true, childClass: SerializerComponent})
export class Serializer extends ChildableComponent<Application, SerializerComponent<any>> {

  /**
   * Triggered when the [[Serializer]] begins transforming a project.
   * @event EVENT_BEGIN
   */
  static EVENT_BEGIN = 'begin';

  /**
   * Triggered when the [[Serializer]] has finished transforming a project.
   * @event EVENT_END
   */
  static EVENT_END = 'end';

  private router!: Map<any, { symbol: any, group: SerializerComponent<any>[] }>;
  private routes!: any[];

  initialize(): void {
    this.router = new Map<any, { symbol: any, group: SerializerComponent<any>[] }>();
    this.routes = [];
  }

  addComponent<T extends SerializerComponent<any> & Component>(name: string, componentClass: T | ComponentClass<T>): T {
    const component = super.addComponent(name, componentClass);

    if (component.serializeGroup && component.serializeGroupSymbol) {
      let match = this.router.get(component.serializeGroup);

      if (!match) {
        match = Array.from(this.router.values()).find( v => v.symbol === component.serializeGroupSymbol)
          || { symbol: component.serializeGroupSymbol , group: [] };
        this.router.set(component.serializeGroup, match);
        this.routes.push(component.serializeGroup);
      }
      match.group.push(component);
      match.group.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    return component;
  }

  /**
   * Remove a child component from the registry.
   * @param name The name the component registered as
   */
  removeComponent(name: string): SerializerComponent<any> | undefined {
    const component = super.removeComponent(name);
    const symbol = component && component.serializeGroupSymbol;
    if (symbol) {
      const values = Array.from(this.router.values());
      for (let i = 0, len = values.length; i < len; i++) {
        const idx = values[i].group.findIndex( o => o === symbol );
        if (idx > -1) {
          values[i].group.splice(idx, 1);
          break;
        }
      }
    }
    return component;
  }

  removeAllComponents() {
    super.removeAllComponents();

    this.router = new Map<any, { symbol: any, group: SerializerComponent<any>[] }>();
    this.routes = [];
  }

  toObject(value: any, obj?: any): any {
    return this.findRoutes(value)
      .reduce( (result, curr) => curr.toObject(value, result), obj);
  }

  /**
   * Same as toObject but emits [[ Serializer#EVENT_BEGIN ]] and [[ Serializer#EVENT_END ]] events.
   * @param value
   * @param eventData Partial information to set in the event
   * @return {any}
   */
  projectToObject(value: ProjectReflection, eventData?: { begin?: any, end?: any }): any {
    const eventBegin = new SerializeEvent(Serializer.EVENT_BEGIN, value);

    if (eventData && eventData.begin) {
      Object.assign(eventBegin, eventData.begin);
    }
    let project: any = eventBegin.output = {};

    this.trigger(eventBegin);
    project = this.toObject(value, project);

    const eventEnd = new SerializeEvent(Serializer.EVENT_END, value);
    if (eventData && eventData.end) {
      Object.assign(eventEnd, eventData.end);
    }
    eventEnd.output = project;
    this.trigger(eventEnd);

    return project;
  }

  private findRoutes(value: any): SerializerComponent<any>[] {
    const routes: SerializerComponent<any>[] = [];
    for (let i = 0, len = this.routes.length; i < len; i++) {
      if (this.routes[i](value)) {
        const serializers = this.router.get(this.routes[i])!.group;
        for (let serializer of serializers) {
          if (serializer.supports(value)) {
            routes.push(serializer);
          }
        }
      }
    }
    return routes;
  }
}
