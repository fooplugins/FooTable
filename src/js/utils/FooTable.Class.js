(function (F) {
	"use strict";

	if (!Object.create) {
		Object.create = (function () {
			var Object = function () {};
			return function (prototype) {
				if (arguments.length > 1)
					throw Error('Second argument not supported');

				if (!F.is.object(prototype))
					throw TypeError('Argument must be an object');

				Object.prototype = prototype;
				var result = new Object();
				Object.prototype = null;
				return result;
			};
		})();
	}

	/**
	 * This base implementation does nothing except provide access to the {@link FooTable.Class#extend} method.
	 * @constructs FooTable.Class
	 * @classdesc This class is based off of John Resig's [Simple JavaScript Inheritance]{@link http://ejohn.org/blog/simple-javascript-inheritance} but it has been updated to be ES 5.1
	 * compatible by implementing an [Object.create polyfill]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * for older browsers.
	 * @see {@link http://ejohn.org/blog/simple-javascript-inheritance}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * @returns {FooTable.Class}
	 */
	function Class() {}

	var __extendable__ = /xyz/.test(function () {xyz;}) ? /\b_super\b/ : /.*/;

	// this._super() within the context of the new function is a pointer to the original function
	// except if the hook param is specified then the this._super variable is the result of the original function
	Class.__extend__ = function(proto, name, func, original){
		// to all who venture here, here be dragons!
		proto[name] = F.is.fn(original) && __extendable__.test(func) ?
			(function (name, fn) {
				return function () {
					var tmp, ret;
					tmp = this._super;
					this._super = original;
					ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, func) : func;
	};

	/**
	 * Creates a new class that inherits from this class which in turn allows itself to be extended or if a name and function is supplied extends only that specific function on the class.
	 * @param {(object|string)} arg1 - An object containing any new methods/members to implement or the name of the method to extend.
	 * @param {function} arg2 - If the first argument is a method name then this is the new function to replace it with.
	 * @returns {FooTable.Class} A new class that inherits from the base class.
	 * @example <caption>The below shows an example of how to implement inheritance using this method.</caption>
	 * var Person = FooTable.Class.extend({
	 *   construct: function(isDancing){
	 *     this.dancing = isDancing;
	 *   },
	 *   dance: function(){
	 *     return this.dancing;
	 *   }
	 * });
	 *
	 * var Ninja = Person.extend({
	 *   construct: function(){
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
	Class.extend = function (arg1 , arg2) {
		var args = Array.prototype.slice.call(arguments);
		arg1 = args.shift();
		arg2 = args.shift();

		function __extend__(proto, name, func, original){
			// to all who venture here, here be dragons!
			proto[name] = F.is.fn(original) && __extendable__.test(func) ?
				(function (name, fn, ofn) {
					return function () {
						var tmp, ret;
						tmp = this._super;
						this._super = ofn;
						ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, func, original) : func;
		}

		if (F.is.hash(arg1)){
			var proto = Object.create(this.prototype),
				_super = this.prototype;
			for (var name in arg1) {
				if (name === '__ctor__') continue;
				__extend__(proto, name, arg1[name], _super[name]);
			}
			var obj = F.is.fn(proto.__ctor__) ? proto.__ctor__ : function () {
				if (!F.is.fn(this.construct))
					throw new SyntaxError('FooTable class objects must be constructed with the "new" keyword.');
				this.construct.apply(this, arguments);
			};
			proto.construct = F.is.fn(proto.construct) ? proto.construct : function(){};
			obj.prototype = proto;
			proto.constructor = obj;
			obj.extend = Class.extend;
			return obj;
		} else if (F.is.string(arg1) && F.is.fn(arg2)) {
			__extend__(this.prototype, arg1, arg2, this.prototype[arg1]);
		}
	};

	F.Class = Class;

	F.ClassFactory = F.Class.extend(/** @lends FooTable.ClassFactory */{
		/**
		 * This is a simple factory for {@link FooTable.Class} objects allowing them to be registered using a friendly name
		 * and then new instances can be created using this friendly name.
		 * @constructs
		 * @extends FooTable.Class
		 * @returns {FooTable.ClassFactory}
		 * @this FooTable.ClassFactory
		 */
		construct: function(){
			/**
			 * An object containing all registered classes.
			 * @type {{}}
			 */
			this.registered = {};
		},
		/**
		 * Checks if the factory contains a class registered using the supplied name.
		 * @instance
		 * @param {string} name - The name of the class to check.
		 * @returns {boolean}
		 * @this FooTable.ClassFactory
		 */
		contains: function(name){
			return F.is.defined(this.registered[name]);
		},
		/**
		 * Gets an array of all registered names.
		 * @instance
		 * @returns {Array.<string>}
		 * @this FooTable.ClassFactory
		 */
		names: function(){
			var names = [], name;
			for (name in this.registered){
				if (!this.registered.hasOwnProperty(name)) continue;
				names.push(name);
			}
			return names;
		},
		/**
		 * Registers a class object using the supplied friendly name and priority. The priority is only taken into account when loading all registered classes
		 * using the {@link FooTable.ClassFactory#load} method.
		 * @instance
		 * @param {string} name - The friendly name of the class.
		 * @param {function} klass - The class to register.
		 * @param {number} priority - This determines the order that the class is created when using the {@link FooTable.ClassFactory#load} method, higher values are loaded first.
		 * @this FooTable.ClassFactory
		 */
		register: function(name, klass, priority){
			if (!F.is.string(name) || !F.is.fn(klass)) return;
			var current = this.registered[name];
			this.registered[name] = {
				name: name,
				klass: klass,
				priority: F.is.number(priority) ? priority : (F.is.defined(current) ? current.priority : 0)
			};
		},
		/**
		 * Creates new instances of all registered classes using there priority and the supplied arguments to return them in an array.
		 * @instance
		 * @param {object} subs - An object containing classes to substitute on load.
		 * @param {*} arg1 - The first argument to supply when creating new instances of all registered classes.
		 * @param {*} [argN...] - Any number of additional arguments to supply when creating new instances of all registered classes.
		 * @returns {Array.<FooTable.Class>}
		 * @this FooTable.ClassFactory
		 */
		load: function(subs, arg1, argN){
			var self = this, args = Array.prototype.slice.call(arguments), reg = [], loaded = [], name, klass;
			subs = args.shift() || {};
			for (name in self.registered){
				if (!self.registered.hasOwnProperty(name)) continue;
				var component = self.registered[name];
				if (subs.hasOwnProperty(name)){
					klass = subs[name];
					if (F.is.string(klass)) klass = F.getFnPointer(subs[name]);
					if (F.is.fn(klass)){
						component = {name: name, klass: klass, priority: self.registered[name].priority};
					}
				}
				reg.push(component);
			}
			for (name in subs){
				if (!subs.hasOwnProperty(name) || self.registered.hasOwnProperty(name)) continue;
				klass = subs[name];
				if (F.is.string(klass)) klass = F.getFnPointer(subs[name]);
				if (F.is.fn(klass)){
					reg.push({name: name, klass: klass, priority: 0});
				}
			}
			reg.sort(function(a, b){ return b.priority - a.priority; });
			F.arr.each(reg, function(r){
				if (F.is.fn(r.klass)){
					loaded.push(self._make(r.klass, args));
				}
			});
			return loaded;
		},
		/**
		 * Create a new instance of a single class using the supplied name and arguments.
		 * @instance
		 * @param {string} name - The name of the class to create.
		 * @param {*} arg1 - The first argument to supply to the new instance.
		 * @param {*} [argN...] - Any number of additional arguments to supply to the new instance.
		 * @returns {FooTable.Class}
		 * @this FooTable.ClassFactory
		 */
		make: function(name, arg1, argN){
			var self = this, args = Array.prototype.slice.call(arguments), reg;
			name = args.shift();
			reg = self.registered[name];
			if (F.is.fn(reg.klass)){
				return self._make(reg.klass, args);
			}
			return null;
		},
		/**
		 * This in effect lets us use the "apply" method on a function using the "new" keyword.
		 * @instance
		 * @private
		 * @param {function} klass
		 * @param args
		 * @returns {FooTable.Class}
		 * @this FooTable.ClassFactory
		 */
		_make: function(klass, args){
			function Class() {
				return klass.apply(this, args);
			}
			Class.prototype = klass.prototype;
			return new Class();
		}
	});

})(FooTable);