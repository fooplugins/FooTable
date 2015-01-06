(function($, FooTable){

	FooTable.AddOn = FooTable.Component.extend(/** @lends FooTable.AddOn */{
		/**
		 * The base class for all FooTable add-ons.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {string} name - The name of the add-on.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the add-on.
		 * @throws {TypeError} The name parameter cannot be an empty or null string.
		 * @throws {TypeError} The instance parameter must be an instance of {@link FooTable.Instance}.
		 * @returns {FooTable.AddOn}
		 */
		ctor: function (name, instance) {
			if (typeof name !== 'string' || name.length === 0)
				throw new TypeError('The name parameter cannot be an empty or null string.');

			/**
			 * The name of the add-on.
			 * @type {string}
			 */
			this.name = name;
			// call the base constructor
			this._super(instance);
		}
	});

})(jQuery, FooTable = window.FooTable || {});