import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";

export function analytics(_ctx: DefaultThemeRenderContext, props: PageEvent<Reflection>) {
    if (!props.settings.gaID) return;

    return (
        <script>
            (function(i,s,o,g,r,a,m){"{"}
            i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){"{"}
            (i[r].q=i[r].q||[]).push(arguments){"}"},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            {"}"}
            )(window,document,'script','//www.google-analytics.com/analytics.js','ga'); ga('create', '
            {props.settings.gaID}', '{props.settings.gaSite}'); ga('send', 'pageview');
        </script>
    );
}
