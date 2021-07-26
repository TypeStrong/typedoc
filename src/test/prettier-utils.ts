import * as prettier from 'prettier';

export function canonicalizeHtml(text: string) {
    return prettier.format(text, {
        parser: 'html-tests',
        useTabs: true,
        printWidth: 600,
        plugins: [{
            languages: [{
                name: 'html-tests',
                parsers: ['html-tests']
            }],
            parsers: {
                'html-tests': {
                    astFormat: 'html',
                    parse(text: string, parsers: any, options: any) {
                        const ast = parsers.html(text, parsers, options);
                        normalizeAttrsRecursive(ast);
                        return ast;
                    }
                }
            },
        }],
    } as any);

    function normalizeAttrsRecursive(node: any) {
        if(node.attrs) node.attrs.sort((a: any, b: any) => {
            return a.name > b.name ? 1 : -1;
        });
        if(node.children) {
            for(const child of node.children) {
                normalizeAttrsRecursive(child);
            }
        }
    }
}
