module theme
{
    module search
    {
        interface IDocument {

        }


        var $el:JQuery = $('#tsd-search');

        var $field:JQuery = $('#tsd-search-field');

        var index:lunr.Index;


        $field.on('focusin', () => {
            $field.off('focusin');
            $.getJSON($el.attr('data-index'), (data) => {
                index = lunr(function () {
                    this.field('name', {boost: 10});
                    this.field('body');
                    this.ref('id');
                });

                var rows = data.rows;
                for (var n = 0, c = 10/*rows.length*/; n < c; n++) {
                    index.add(rows[n]);
                }
            });
        });


        $field.on('change', () => {
            console.log(index);
        });
    }
}