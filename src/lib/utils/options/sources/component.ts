import { Component, ComponentEvent, AbstractComponent, ChildableComponent } from '../../component';
import { OptionsComponent } from '../options';

@Component({name: 'options:component'})
export class ComponentSource extends OptionsComponent {
    private knownComponents: string[];

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

        if (this.knownComponents.indexOf(name) === -1) {
            this.knownComponents.push(name);
            this.owner.addDeclarations(component.getOptionDeclarations());
        }

        if (component instanceof ChildableComponent) {
            for (let child of component.getComponents()) {
                this.addComponent(child);
            }
        }
    }

    private onComponentAdded(e: ComponentEvent) {
        this.addComponent(e.component);
    }

    private onComponentRemoved(e: ComponentEvent) {
        const declarations = e.component.getOptionDeclarations();
        for (let declaration of declarations) {
            this.owner.removeDeclarationByName(declaration.name);
        }
    }
}
