(function($, FooTable){

	/**
	 * This namespace contains the methods and members for add-on management.
	 * @namespace
	 */
	FooTable.addons = {
		/**
		 * An array containing all registered add-ons for the plugin.
		 * @type {Array.<FooTable.AddOn>}
		 * @default []
		 */
		registered: [],
		/**
		 * Registers the specified add-on enabling a new instance of the add-on to be created for each new instance of the plugin.
		 * @param {FooTable.AddOn} addOn - The add-on to register with the plugin.
		 * @throws {TypeError} The addOn parameter must be a pointer to a class that inherits from {@link FooTable.AddOn}.
		 */
		register: function(addOn){
			if (typeof addOn !== 'function')
				throw new TypeError('The addOn parameter must be a pointer to a class that inherits from FooTable.AddOn.');
			this.registered.push(addOn);
		},
		/**
		 * Creates a new instance of each registered add-on and returns them all in an array.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the add-on.
		 * @returns {Array}
		 */
		ctor: function(instance){
			var loaded = [];
			$.each(this.registered, function(i, addOn){
				loaded = new addOn(instance);
			});
			return loaded;
		},
		/**
		 * Gets an instance add-on by name.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object containing the add-ons.
		 * @param {string} name - The name of the add-on to retrieve
		 * @returns {(FooTable.AddOn|null)}
		 */
		get: function(instance, name){
			var found = null;
			$.each(instance.components.addons, function(i, addOn){
				if (addOn.name === name){
					found = addOn;
					return false;
				}
			});
			return found;
		}
	};

})(jQuery, FooTable = window.FooTable || {});