import * as shiki from "shiki"
import { Highlighter } from "shiki/dist/highlighter"

const highlighter: {instance: Highlighter | undefined} = { instance: undefined };

export const loadHighlighter = async () => {
    try {
        highlighter.instance = await shiki.getHighlighter({ theme: 'nord' });
    } catch (error) {
        console.error(error);
    }
}

export const getHighlighter = (): Highlighter | undefined => {
    return highlighter.instance;
}
