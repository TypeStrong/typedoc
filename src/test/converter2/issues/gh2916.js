/**
 * @typedef {object} HelloProps {@inline}
 * @property {string} name Name property docs
 */

/**
 * @param {HelloProps} props
 */
export function hello(props) {
    return "Hello {props.name}!";
}
