var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("./EventDispatcher");
var PluginHost = (function (_super) {
    __extends(PluginHost, _super);
    function PluginHost() {
        _super.apply(this, arguments);
    }
    PluginHost.prototype.getParameters = function () {
        var result = [];
        for (var key in this.plugins) {
            if (!this.plugins.hasOwnProperty(key))
                continue;
            var plugin = this.plugins[key];
            if (plugin.getParameters) {
                result.push.call(result, plugin.getParameters());
            }
        }
        return result;
    };
    PluginHost.prototype.getPlugin = function (name) {
        if (this.plugins[name]) {
            return this.plugins[name];
        }
        else {
            return null;
        }
    };
    PluginHost.prototype.addPlugin = function (name, pluginClass) {
        if (!this.plugins)
            this.plugins = {};
        if (this.plugins[name]) {
            return null;
        }
        else {
            return this.plugins[name] = new pluginClass(this);
        }
    };
    PluginHost.prototype.removePlugin = function (name) {
        if (this.plugins[name]) {
            this.plugins[name].remove();
            delete this.plugins[name];
            return true;
        }
        else {
            return false;
        }
    };
    PluginHost.prototype.removeAllPlugins = function () {
        for (var name in this.plugins) {
            if (!this.plugins.hasOwnProperty(name))
                continue;
            this.plugins[name].remove();
        }
        this.plugins = {};
    };
    PluginHost.registerPlugin = function (name, pluginClass) {
        if (!this.PLUGINS)
            this.PLUGINS = {};
        this.PLUGINS[name] = pluginClass;
    };
    PluginHost.loadPlugins = function (instance) {
        for (var name in this.PLUGINS) {
            if (!this.PLUGINS.hasOwnProperty(name))
                continue;
            instance.addPlugin(name, this.PLUGINS[name]);
        }
    };
    return PluginHost;
})(EventDispatcher_1.EventDispatcher);
exports.PluginHost = PluginHost;
