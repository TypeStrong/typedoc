module typedoc
{
    $('.tsd-signatures').each((n, el) => {
        var $signatures, $descriptions

        function init():boolean {
            var $el = $(el);
            $signatures = $el.find('> .tsd-signature');
            if ($signatures.length < 2) {
                return false;
            }

            var $cn = $el.siblings('.tsd-descriptions');
            $descriptions = $cn.find('> .tsd-description');

            $el.addClass('active');
            $cn.addClass('active');
            return true;
        }


        function setIndex(index:number) {
            $signatures.removeClass('current').eq(index).addClass('current');
            $descriptions.removeClass('current').eq(index).addClass('current');
        }


        if (init()) {
            $signatures.on('click', (e:JQueryMouseEventObject) => {
                setIndex($signatures.index(<Element>e.currentTarget));
            });

            setIndex(0);
        }
    });
}