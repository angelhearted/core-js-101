/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consist of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  props: {},
  combo: '',

  getThis() {
    if (Object.keys(this.props).length) {
      return this;
    }
    const result = { ...this };
    result.props = {};
    return result;
  },

  element(value) {
    const self = this.getThis();
    if (self.props.element) {
      throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    } else if (self.props.pseudoElement || self.props.pseudoClasses
      || self.props.attrs || self.props.classes || self.props.id) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    self.props.element = value;
    return self;
  },

  id(value) {
    const self = this.getThis();
    if (self.props.id) {
      throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    } else if (self.props.pseudoElement || self.props.pseudoClasses
      || self.props.attrs || self.props.classes) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    self.props.id = value;
    return self;
  },

  class(value) {
    const self = this.getThis();
    if (self.props.pseudoElement || self.props.pseudoClasses || self.props.attrs) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    if (self.props.classes) {
      self.props.classes.push(value);
    } else {
      self.props.classes = [value];
    }
    return self;
  },

  attr(value) {
    const self = this.getThis();
    if (self.props.pseudoElement || self.props.pseudoClasses) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    if (self.props.attrs) {
      self.props.attrs.push(value);
    } else {
      self.props.attrs = [value];
    }
    return self;
  },

  pseudoClass(value) {
    const self = this.getThis();
    if (self.props.pseudoElement) {
      throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    if (self.props.pseudoClasses) {
      self.props.pseudoClasses.push(value);
    } else {
      self.props.pseudoClasses = [value];
    }
    return self;
  },

  pseudoElement(value) {
    const self = this.getThis();
    if (self.props.pseudoElement) {
      throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    self.props.pseudoElement = value;
    return self;
  },

  combine(selector1, combinator, selector2) {
    const part1 = typeof selector1 === 'string' ? selector1 : selector1.stringify();
    const part2 = typeof selector2 === 'string' ? selector2 : selector2.stringify();
    this.combo = `${part1} ${combinator} ${part2}`;
    return this;
  },

  stringify() {
    const p = this.props;
    this.props = {};

    if (this.combo) {
      const c = this.combo;
      this.combo = '';
      return c;
    }

    // order: element, id, class, attribute, pseudo-class, pseudo-element
    const element = p.element || '';
    const id = p.id ? `#${p.id}` : '';
    const classes = p.classes ? `.${p.classes.join('.')}` : '';
    const attributes = p.attrs ? p.attrs.map((a) => `[${a}]`).join('') : '';
    const pseudoClasses = p.pseudoClasses ? `:${p.pseudoClasses.join(':')}` : '';
    const pseudoElement = p.pseudoElement ? `::${p.pseudoElement}` : '';
    return `${element}${id}${classes}${attributes}${pseudoClasses}${pseudoElement}`;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
