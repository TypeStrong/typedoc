import * as Handlebars from 'handlebars';
function getTemplate(raw: string, options?: CompileOptions | undefined){

    let template = Handlebars.compile(raw, options);
    return function(context: any, options?: Handlebars.RuntimeOptions | undefined ){

        //RaynorChen @ Jan.13, 2020 
        //https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access
        var securityWorkaroundOptions = {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
            allowedProtoMethods :{
                constructor: true,
                __defineGetter__: true,
                __defineSetter__: true,
                __lookupGetter__: true,
                __lookupSetter__: true,

            },
            allowedProtoProperties:{
                __proto__: true,
            }
        };
        if (options){
            options = {
                ...options,
                ...securityWorkaroundOptions
            }
        }else{
            options = securityWorkaroundOptions
        }
        return template(context, options)
    }
}


export {
    getTemplate
}

