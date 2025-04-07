/**
 * @typedef {object} HelloProps
 * @property {string} name Name property docs
 */

/**
 * @inlineType HelloProps
 * @param {HelloProps} props
 */
export function hello(props) {
    return "Hello {props.name}!";
}
