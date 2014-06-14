module tsd.search
{
    enum SearchLoadingState
    {
        Idle, Loading, Ready, Failure
    }


    var $el:JQuery = $('#tsd-search');

    /**
     *
     */
    var $field:JQuery = $('#tsd-search-field');

    var $results:JQuery = $('.results');

    var base:string = $el.attr('data-base') + '/';

    var query:string = '';

    /**
     * The state the search is currently in.
     */
    var loadingState:SearchLoadingState = SearchLoadingState.Idle;

    var hasFocus:boolean = false;

    /**
     * The lunr index used to search the documentation.
     */
    var index:lunr.Index;


    /**
     * Instantiate the lunr index.
     */
    function createIndex() {
        index = new lunr.Index();
        index.pipeline.add(
            lunr.trimmer
        );

        index.field('name', {boost:10});
        index.field('parent');
        index.ref('id');

        var rows   = data.rows;
        var pos    = 0;
        var length = rows.length;
        function batch() {
            var cycles = 0;
            while (cycles++ < 100) {
                index.add(rows[pos]);
                if (++pos == length) {
                    return setLoadingState(SearchLoadingState.Ready);
                }
            }
            setTimeout(batch, 10);
        }

        batch();
    }


    function loadIndex() {
        if (loadingState != SearchLoadingState.Idle) return;
        setTimeout(() => {
            if (loadingState == SearchLoadingState.Idle) {
                setLoadingState(SearchLoadingState.Loading);
            }
        }, 250);

        if (typeof data != 'undefined') {
            createIndex();
        } else {
            $.get($el.attr('data-index'))
                .done((source:string) => {
                    eval(source);
                    createIndex();
                }).fail(() => {
                    setLoadingState(SearchLoadingState.Failure);
                });
        }
    }


    /**
     * Update the visible state of the search control.
     */
    function updateResults() {
        if (loadingState != SearchLoadingState.Ready) return;
        $results.empty();

        var res = index.search(query);
        for (var i = 0, c = Math.min(10, res.length); i < c; i++) {
            var row = data.rows[res[i].ref];
            var name = row.name;
            if (row.parent) name = '<span class="parent">' + row.parent + '.</span>' + name;
            name = '<span class="kind">' + data.kinds[row.kind] + '</span> ' + name;
            $results.append('<li><a href="' + base + row.url + '">' + name + '</li>');
        }
    }


    function setLoadingState(value:SearchLoadingState) {
        if (loadingState == value) return;

        $el.removeClass(SearchLoadingState[loadingState].toLowerCase());
        loadingState = value;
        $el.addClass(SearchLoadingState[loadingState].toLowerCase());

        if (value == SearchLoadingState.Ready) {
            updateResults();
        }
    }


    function setHasFocus(value:boolean) {
        if (hasFocus == value) return;
        hasFocus = value;
        $el.toggleClass('has-focus');

        if (!value) {
            $field.val(query);
        } else {
            setQuery('');
            $field.val('');
        }
    }


    function setQuery(value:string) {
        query = $.trim(value);
        updateResults();
    }


    function setCurrentResult(dir:number) {
        var $current = $results.find('.current');
        if ($current.length == 0) {
            $results.find(dir == 1 ? 'li:first-child' : 'li:last-child').addClass('current');
        } else {
            var $rel = dir == 1 ? $current.next('li') : $current.prev('li');
            if ($rel.length > 0) {
                $current.removeClass('current');
                $rel.addClass('current');
            }
        }
    }


    /**
     * Bind all required events on the input field.
     */
    $field.on('focusin', () => {
        setHasFocus(true);
        loadIndex();
    }).on('focusout', () => {
        setTimeout(() => setHasFocus(false), 100);
    }).on('input', () => {
        setQuery($.trim($field.val()));
    }).on('keydown', (e:JQueryKeyEventObject) => {
        if (e.keyCode == 40) {
            setCurrentResult(1);
        } else if (e.keyCode == 38) {
            setCurrentResult(-1);
        } else if (e.keyCode == 13) {
            var $current = $results.find('.current');
            if ($current.length == 0) $current = $results.find('li:first-child');
            if ($current.length > 0) window.location.href = $current.find('a').prop('href');
        }
    });
}