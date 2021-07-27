import * as prettier from 'prettier';

export function canonicalizeHtml(text: string) {
    const preprocessed = text.replace(/[ \t\n]*<md data-markdown="true">/g, '\n').replace(/<\/md>[ \t\n]*/g, '\n');
    return prettier.format(preprocessed, {
        parser: 'html-tests',
        useTabs: true,
        printWidth: 120,
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
    } as any).trim();
}

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
