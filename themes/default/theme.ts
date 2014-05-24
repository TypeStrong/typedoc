/// <reference path="../../bin/typedoc.d.ts" />

interface ITemplateMapping {
    kind:any;
    isLeaf:boolean;
    prefix:string;
    template:string;
}


export class Theme extends TypeDoc.Renderer.BaseTheme
{
    static MAPPINGS:ITemplateMapping[] = [{
        kind:     TypeDoc.Models.Kind.Class,
        isLeaf:   true,
        prefix:   'classes',
        template: 'reflection.hbs'
    },{
        kind:     TypeDoc.Models.Kind.Interface,
        isLeaf:   true,
        prefix:   'interfaces',
        template: 'reflection.hbs'
    },{
        kind:     TypeDoc.Models.Kind.Enum,
        isLeaf:   true,
        prefix:   'enums',
        template: 'reflection.hbs'
    },{
        kind:     [TypeDoc.Models.Kind.Container, TypeDoc.Models.Kind.DynamicModule],
        isLeaf:   false,
        prefix:   'modules',
        template: 'reflection.hbs'
    }];



    isOutputDirectory(dirname:string):boolean {
        // if (!FS.existsSync(Path.join(dirname, 'index.html'))) return false;
        if (!FS.existsSync(Path.join(dirname, 'assets'))) return false;

        return true;
    }


    private getMapping(reflection:TypeDoc.Models.DeclarationReflection):ITemplateMapping {
        for (var i = 0, c = Theme.MAPPINGS.length; i < c; i++) {
            var mapping = <any>Theme.MAPPINGS[i];
            if (reflection.kindOf(mapping.kind)) {
                return mapping;
            }
        }

        return null;
    }


    /**
     * Build the urls for the current project.
     *
     * @returns  An array of url mappings.
     */
    getUrls():TypeDoc.Models.UrlMapping[]
    {
        var urls = [];

        var createUrl = (reflection:TypeDoc.Models.BaseReflection, to?:TypeDoc.Models.BaseReflection, separator:string = '.') => {
            var url = reflection.getAlias();
            if (reflection.parent && reflection.parent != to && !(reflection.parent instanceof TypeDoc.Models.ProjectReflection)) {
                url = createUrl(reflection.parent, to, separator) + separator + url;
            }
            return url;
        };

        var walkLeaf = (reflection:TypeDoc.Models.BaseReflection, container:TypeDoc.Models.BaseReflection) => {
            reflection.children.forEach((child) => {
                if (child.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    return;
                }

                child.url = container.url + '#' + createUrl(child, container, '.');
                walkLeaf(child, container);
            });
        };

        var walkReflection = (reflection:TypeDoc.Models.BaseReflection, container:TypeDoc.Models.BaseReflection) => {
            reflection.children.forEach((child) => {
                var mapping = this.getMapping(child);
                if (mapping) {
                    child.url = Path.join(mapping.prefix, createUrl(child) + '.html');
                    child.hasOwnDocument = true;
                    urls.push(new TypeDoc.Models.UrlMapping(child.url, child, mapping.template));

                    if (mapping.isLeaf) {
                        walkLeaf(child, child);
                    } else {
                        walkReflection(child, child);
                    }
                } else {
                    child.url = container.url + '#' + createUrl(child, container, '.');
                    walkLeaf(child, container);
                }
            });
        };

        this.project.url = 'modules/_globals.html';
        urls.push(new TypeDoc.Models.UrlMapping('modules/_globals.html', this.project, 'reflection.hbs'));

        walkReflection(this.project, this.project);

        return urls;
    }


    getNavigation():TypeDoc.Models.NavigationItem
    {
        function walkReflection(reflection:TypeDoc.Models.DeclarationReflection, parent:TypeDoc.Models.NavigationItem) {
            var name = parent == root ? reflection.getFullName() : reflection.name;
            var item = new TypeDoc.Models.NavigationItem(name, reflection.url, parent);
            item.isPrimary = (parent == root);
            item.cssClasses = reflection.getCssClasses();

            reflection.children.forEach((child) => {
                if (child.kindOf(TypeDoc.Models.Kind.SomeContainer)) return;
                walkReflection(child, item);
            });
        }


        var root = new TypeDoc.Models.NavigationItem('Index', 'index.html');
        new TypeDoc.Models.NavigationItem('Globals', 'globals.html', root);

        var modules = this.project.getReflectionsByKind(TypeDoc.Models.Kind.SomeContainer);
        modules.forEach((container) => walkReflection(container, root));

        return root;
    }
}