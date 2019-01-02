import { ChildableComponent } from '../utils';
import { Component, ComponentClass } from '../utils/component';
import { Application } from '../application';
import { ProjectReflection } from '../models';

import { SerializerComponent } from './components';
import { SerializeEvent } from './events';
import { ModelToObject } from './schema';

@Component({ name: 'serializer', internal: true, childClass: SerializerComponent })
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

    /**
     * Serializers, sorted by their `serializeGroup` function to enable higher performance.
     */
    private serializers!: Map<(instance: unknown) => boolean, SerializerComponent<any>[]>;

    initialize() {
        super.initialize();
        this.serializers = new Map();
    }

    addComponent<T extends SerializerComponent<any> & Component>(
        name: string,
        componentClass: T | ComponentClass<T>
    ): T {
        const component = super.addComponent(name, componentClass);

        if (component.serializeGroup) {
            let group = this.serializers.get(component.serializeGroup);

            if (!group) {
                this.serializers.set(component.serializeGroup, (group = []));
            }

            group.push(component);
            group.sort((a, b) => b.priority - a.priority);
        }

        return component;
    }

    /**
     * Remove a child component from the registry.
     * @param name The name the component registered as
     */
    removeComponent(name: string): SerializerComponent<any> | undefined {
        const component = super.removeComponent(name);

        if (component && component.serializeGroup) {
            // Remove from the router
            const group = this.serializers.get(component.serializeGroup)!.filter(comp => comp !== component);

            if (group.length) {
                this.serializers.set(component.serializeGroup, group);
            } else {
                this.serializers.delete(component.serializeGroup);
            }
        }

        return component;
    }

    removeAllComponents() {
        super.removeAllComponents();
        this.serializers = new Map();
    }

    toObject<T>(value: T, obj?: Partial<ModelToObject<T>>): ModelToObject<T> {
        // Note: This type *could* potentially lie, if a serializer declares a partial type but fails to provide
        // the defined property, but the benefit of being mostly typed is probably worth it.
        return this.findSerializers(value)
            .reduce((result, curr) => curr.toObject(value, result), obj) as ModelToObject<T>;
    }

    /**
     * Same as toObject but emits [[ Serializer#EVENT_BEGIN ]] and [[ Serializer#EVENT_END ]] events.
     * @param value
     * @param eventData Partial information to set in the event
     */
    projectToObject(value: ProjectReflection, eventData?: { begin?: any; end?: any }): ModelToObject<ProjectReflection> {
        const eventBegin = new SerializeEvent(Serializer.EVENT_BEGIN, value);

        if (eventData && eventData.begin) {
            Object.assign(eventBegin, eventData.begin);
        }
        let project: any = (eventBegin.output = {});

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

    private findSerializers<T>(value: T): SerializerComponent<T>[] {
        const routes: SerializerComponent<T>[] = [];

        for (const [groupSupports, components] of this.serializers.entries()) {
            if (groupSupports(value)) {
                for (const component of components) {
                    if (component.supports(value)) {
                        routes.push(component);
                    }
                }
            }
        }

        return routes;
    }
}
