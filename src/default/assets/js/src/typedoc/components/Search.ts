declare module typedoc.search
{
    interface IDocument {
        id:number;
        kind:number;
        name:string;
        url:string;
        classes:string;
        parent?:string;
    }

    interface IData {
        kinds:{[kind:number]:string};
        rows:IDocument[];
    }

    var data:IData;
}


module typedoc.search
{
    /**
     * Loading state definitions.
     */
    enum SearchLoadingState
    {
        Idle, Loading, Ready, Failure
    }


    /**
     * The element holding the search widget and results.
     */
    var $el:JQuery = $('#tsd-search');

    /**
     * The input field of the search widget.
     */
    var $field:JQuery = $('#tsd-search-field');

    /**
     * The result list wrapper.
     */
    var $results:JQuery = $('.results');

    /**
     * The base url that must be prepended to the indexed urls.
     */
    var base:string = $el.attr('data-base') + '/';

    /**
     * The current query string.
     */
    var query:string = '';

    /**
     * The state the search is currently in.
     */
    var loadingState:SearchLoadingState = SearchLoadingState.Idle;

    /**
     * Is the input field focused?
     */
    var hasFocus:boolean = false;

    /**
     * Should the next key press be prevents?
     */
    var preventPress:boolean = false;

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


    /**
     * Lazy load the search index and parse it.
     */
    function loadIndex() {
        if (loadingState != SearchLoadingState.Idle) return;
        setTimeout(() => {
            if (loadingState == SearchLoadingState.Idle) {
                setLoadingState(SearchLoadingState.Loading);
            }
        }, 500);

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
            $results.append('<li class="' + row.classes + '"><a href="' + base + row.url + '" class="tsd-kind-icon">' + name + '</li>');
        }
    }


    /**
     * Set the loading state and update the visual state accordingly.
     */
    function setLoadingState(value:SearchLoadingState) {
        if (loadingState == value) return;

        $el.removeClass(SearchLoadingState[loadingState].toLowerCase());
        loadingState = value;
        $el.addClass(SearchLoadingState[loadingState].toLowerCase());

        if (value == SearchLoadingState.Ready) {
            updateResults();
        }
    }


    /**
     * Set the focus state and update the visual state accordingly.
     */
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


    /**
     * Set the query string and update the results.
     */
    function setQuery(value:string) {
        query = $.trim(value);
        updateResults();
    }


    /**
     * Move the highlight within the result set.
     */
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
     * Navigate to the highlighted result.
     */
    function gotoCurrentResult() {
        var $current = $results.find('.current');

        if ($current.length == 0) {
            $current = $results.find('li:first-child');
        }

        if ($current.length > 0) {
            window.location.href = $current.find('a').prop('href');
            $field.blur();
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
        if (e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 38 || e.keyCode == 40) {
            preventPress = true;
            e.preventDefault();

            if (e.keyCode == 13) {
                gotoCurrentResult();
            } else if (e.keyCode == 27) {
                $field.blur();
            } else if (e.keyCode == 38) {
                setCurrentResult(-1);
            } else if (e.keyCode == 40) {
                setCurrentResult(1);
            }
        } else {
            preventPress = false;
        }
    }).on('keypress', (e) => {
        if (preventPress) e.preventDefault();
    });


    /**
     * Start searching by pressing a key on the body.
     */
    $('body').on('keydown', (e:JQueryKeyEventObject) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (!hasFocus && e.keyCode > 47 && e.keyCode < 112) {
            $field.focus();
        }
    });
}