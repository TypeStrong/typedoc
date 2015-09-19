var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("../../component");
var options_1 = require("../options");
var ComponentSource = (function (_super) {
    __extends(ComponentSource, _super);
    function ComponentSource() {
        _super.apply(this, arguments);
    }
    ComponentSource.prototype.initialize = function () {
        this.knownComponents = [];
        this.addComponent(this.application);
        this.listenTo(this.application, (_a = {},
            _a[component_1.ComponentEvent.ADDED] = this.onComponentAdded,
            _a[component_1.ComponentEvent.REMOVED] = this.onComponentRemoved,
            _a
        ));
        var _a;
    };
    ComponentSource.prototype.addComponent = function (component) {
        var name = component.componentName;
        if (!name) {
            this.application.logger.error("Component without name found.");
            return;
        }
        if (this.knownComponents.indexOf(name) === -1) {
            this.knownComponents.push(name);
            this.owner.addDeclarations(component.getOptionDeclarations());
        }
        if (component instanceof component_1.ChildableComponent) {
            for (var _i = 0, _a = component.getComponents(); _i < _a.length; _i++) {
                var child = _a[_i];
                this.addComponent(child);
            }
        }
    };
    ComponentSource.prototype.removeComponent = function (component) {
        var name = component.componentName;
        var index = this.knownComponents.indexOf(name);
        if (index != -1) {
            this.knownComponents.slice(index, 1);
            for (var _i = 0, _a = component.getOptionDeclarations(); _i < _a.length; _i++) {
                var declaration = _a[_i];
                this.owner.removeDeclarationByName(declaration.name);
            }
        }
        if (component instanceof component_1.ChildableComponent) {
            for (var _b = 0, _c = component.getComponents(); _b < _c.length; _b++) {
                var child = _c[_b];
                this.removeComponent(child);
            }
        }
    };
    ComponentSource.prototype.onComponentAdded = function (e) {
        this.addComponent(e.component);
    };
    ComponentSource.prototype.onComponentRemoved = function (e) {
        var declarations = e.component.getOptionDeclarations();
        for (var _i = 0; _i < declarations.length; _i++) {
            var declaration = declarations[_i];
            this.owner.removeDeclarationByName(declaration.name);
        }
    };
    ComponentSource = __decorate([
        component_1.Component({ name: "options:component" }), 
        __metadata('design:paramtypes', [])
    ], ComponentSource);
    return ComponentSource;
})(options_1.OptionsComponent);
exports.ComponentSource = ComponentSource;
