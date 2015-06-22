(function (FooTable) {
	"use strict";

	if (!FooTable.is.fn(Object.create)) {
		Object.create = (function () {
			var Object = function () {};
			return function (prototype) {
				if (arguments.length > 1)
					throw Error('Second argument not supported');

				if (!FooTable.is.object(prototype))
					throw TypeError('Argument must be an object');

				Object.prototype = prototype;
				var result = new Object();
				Object.prototype = null;
				return result;
			};
		})();
	}

	var fnTest = /xyz/.test(function () {xyz;}) ? /\b_super\b/ : /.*/;

	/**
	 * This base implementation does nothing except provide access to the {@link FooTable.Class.extend} method for inheritance.
	 * @constructs FooTable.Class
	 * @classdesc This class is based off of John Resig's [Simple JavaScript Inheritance]{@link http://ejohn.org/blog/simple-javascript-inheritance} but it has been updated to be ES 5.1
	 * compatible by implementing an [Object.create polyfill]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * for older browsers.
	 * @see {@link http://ejohn.org/blog/simple-javascript-inheritance}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * @returns {FooTable.Class}
	 */
	function Class() {}

	/**
	 * Creates a new class that inherits from this class which in turn allows itself to be extended.
	 * @param {object} props - Any new methods or members to implement.
	 * @returns {FooTable.Class} A new class that inherits from the base class.
	 * @example <caption>The below shows an example of how to implement inheritance using this method.</caption>
	 * var Person = FooTable.Class.extend({
	 *   ctor: function(isDancing){
	 *     this.dancing = isDancing;
	 *   },
	 *   dance: function(){
	 *     return this.dancing;
	 *   }
	 * });
	 *
	 * var Ninja = Person.extend({
	 *   ctor: function(){
	 *     this._super( false );
	 *   },
	 *   dance: function(){
	 *     // Call the inherited version of dance()
	 *     return this._super();
	 *   },
	 *   swingSword: function(){
	 *     return true;
	 *   }
	 * });
	 *
	 * var p = new Person(true);
	 * p.dance(); // => true
	 *
	 * var n = new Ninja();
	 * n.dance(); // => false
	 * n.swingSword(); // => true
	 *
	 * // Should all be true
	 * p instanceof Person && p instanceof FooTable.Class &&
	 * n instanceof Ninja && n instanceof Person && n instanceof FooTable.Class
	 */
	Class.extend = function (props) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the construct method)
		var proto = Object.create(_super);

		// Copy the properties over onto the new prototype
		for (var name in props) {
			//if (!Object.prototype.hasOwnProperty.call(props, name)) continue;
			// Check if we're overwriting an existing function
			proto[name] = FooTable.is.fn(props[name]) && FooTable.is.fn(_super[name]) && fnTest.test(props[name]) ?
				(function (name, fn) {
					return function () {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, props[name]) :
				props[name];
		}

		// The new constructor
		var newClass = FooTable.is.fn(proto.ctor) ?
			proto.ctor : // All construction is actually done in the construct method
			function () {};

		// Populate our constructed prototype object
		newClass.prototype = proto;

		// Enforce the constructor to be what we expect
		proto.constructor = newClass;

		// And make this class extendable
		newClass.extend = Class.extend;

		return newClass;
	};

	FooTable.Class = Class;

})(FooTable = window.FooTable || {});