/** @typedef {"default" | "healthy" | "warning" | "error" | "checking"} ButtonTone */
/** @typedef {"button" | "submit" | "reset"} ButtonType */
/**
 * @typedef {object} ButtonProps
 * @property {import("react").ReactNode} children Button label/content.
 * @property {boolean} [filled] Whether the button uses a filled background.
 * @property {ButtonTone} [tone] Visual tone of the button.
 * @property {import("react").MouseEventHandler<HTMLButtonElement>} [onClick] Optional click
 *   handler.
 * @property {ButtonType} [type] Native button type.
 * @property {boolean} [disabled] Whether the button is disabled.
 */

/**
 * @typedef {object} CollapsibleProps
 * @property {string} title Visible collapsible title.
 * @property {string} [subtitle] Optional collapsible subtitle.
 * @property {string} [iconName] Optional Material Symbols icon name shown before the title.
 * @property {boolean} [defaultOpen] Whether the collapsible starts expanded.
 * @property {import("react").ReactNode} children Collapsible body content.
 */

export {};
