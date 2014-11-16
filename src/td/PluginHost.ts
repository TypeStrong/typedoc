module td
{
    export interface IPluginInterface {
        remove();
    }


    export class PluginHost extends EventDispatcher
    {
        plugins:ts.Map<IPluginInterface>;

        static PLUGINS:{[name:string]:any};


        addPlugin(name:string, plugin:any):IPluginInterface {
            if (this.plugins[name]) {
                return null;
            } else {
                return this.plugins[name] = new plugin(this);
            }
        }


        removePlugin(name:string):boolean {
            if (this.plugins[name]) {
                this.plugins[name].remove();
                delete this.plugins[name];
                return true;
            } else {
                return false;
            }
        }


        removeAllPlugins() {
            for (var name in this.plugins) {
                if (!this.plugins.hasOwnProperty(name)) continue;
                this.plugins[name].remove();
                delete this.plugins[name];
            }
        }


        static registerPlugin(name:string, plugin:any) {
            if (!this.PLUGINS) this.PLUGINS = {};
            this.PLUGINS[name] = plugin;
        }


        static loadPlugins(instance:any):ts.Map<IPluginInterface> {
            var plugins:ts.Map<IPluginInterface> = {};
            for (var name in this.PLUGINS) {
                if (!this.PLUGINS.hasOwnProperty(name)) continue;
                plugins[name] = new this.PLUGINS[name](instance);
            }

            return plugins;
        }
    }
}