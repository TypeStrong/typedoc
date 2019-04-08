import { Component, ComponentEvent, AbstractComponent, ChildableComponent } from '../../component';
import { OptionsComponent } from '../options';

/**
 * Aggregates options declared by other components.
 *
 * Listens for when a component is added and adds the component's declared
 * options to the `Options` component.
 */
@Component({name: 'options:component'})
export class ComponentSource extends OptionsComponent {
    private knownComponents!: string[];

    protected initialize() {
        this.knownComponents = [];
        this.addComponent(this.application);

        this.listenTo(this.application, {
            [ComponentEvent.ADDED]:   this.onComponentAdded,
            [ComponentEvent.REMOVED]: this.onComponentRemoved
        });
    }

    private addComponent(component: AbstractComponent<any>) {
        const name = component.componentName;
        if (!name) {
            this.application.logger.error('Component without name found.');
            return;
        }

        if (!this.knownComponents.includes(name)) {
            this.knownComponents.push(name);
            this.owner.addDeclarations(component.getOptionDeclarations());
        }

        if (component instanceof ChildableComponent) {
            for (let child of component.getComponents()) {
                this.addComponent(child);
            }
        }
    }

    private removeComponent(component: AbstractComponent<any>) {
        let index = this.knownComponents.indexOf(component.componentName);
        if (index !== -1) {
            this.knownComponents.splice(index, 1);
            for (let declaration of component.getOptionDeclarations()) {
                this.owner.removeDeclarationByName(declaration.name);
            }
        }

        if (component instanceof ChildableComponent) {
            for (let child of component.getComponents()) {
                this.removeComponent(child);
            }
        }
    }

    private onComponentAdded(e: ComponentEvent) {
        this.addComponent(e.component);
    }

    private onComponentRemoved(e: ComponentEvent) {
        this.removeComponent(e.component);
    }
}
