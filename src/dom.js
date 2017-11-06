export {
  $outerWidth,
  $outerHeight,
  $insertAfter,
};

/**
* Get element's height including margins
*
* @param {HTMLElement} element DOM element
* @returns {number} height
*/
function $outerWidth(element) {
  let width = element.offsetWidth;
  const style = getComputedStyle(element);

  width += parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);

  return width;
}

/**
 * Get element's height including margins
 *
 * @param {HTMLElement} element DOM element
 * @returns {number} width
 */
function $outerHeight(element) {
  let height = element.offsetHeight;
  const style = getComputedStyle(element);

  height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);

  return height;
}

/**
 * Insert an element after another.
 *
 * @param {HTMLElement} newElement DOM element to insert
 * @param {HTMLElement} referenceElement reference DOM element
 * @returns {undefined}
 */
function $insertAfter(newElement, referenceElement) {
  referenceElement
    .parentNode
    .insertBefore(newElement, referenceElement.nextSibling);
}
