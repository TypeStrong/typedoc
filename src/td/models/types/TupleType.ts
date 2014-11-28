module td
{
    export class TupleType extends Type
    {
        elements:Type[];


        constructor(elements:Type[]) {
            super();
            this.elements = elements;
        }


        toString() {
            var names = [];
            this.elements.forEach((element) => {
                names.push(element.toString())
            });
            return names.join(' | ');
        }
    }
}