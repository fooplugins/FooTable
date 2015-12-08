(function ($, F) {

	F.Component = F.Class.extend(/** @lends FooTable.Component */{
		/**
		 * The base class for all FooTable components.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Table} instance - The parent {@link FooTable.Table} object for the component.
		 * @param {boolean} enabled - Whether or not the component is enabled.
		 * @throws {TypeError} The instance parameter must be an instance of {@link FooTable.Table}.
		 * @returns {FooTable.Component}
		 */
		construct: function (instance, enabled) {
			if (!(instance instanceof F.Table))
				throw new TypeError('The instance parameter must be an instance of FooTable.Table.');

			/**
			 * The parent {@link FooTable.Table} for the component.
			 * @type {FooTable.Table}
			 */
			this.ft = instance;
			/**
			 * Whether or not this component is enabled. Disabled components only have there preinit method called allowing for this value to be overridden.
			 * @type {boolean}
			 */
			this.enabled = F.is.boolean(enabled) ? enabled : false;
		},
		/**
		 * The preinit method is called during the parent {@link FooTable.Table} constructor call.
		 * @param {object} data - The jQuery.data() object of the root table.
		 * @instance
		 * @protected
		 * @function
		 */
		preinit: null,
		/**
		 * The init method is called during the parent {@link FooTable.Table} constructor call.
		 * @instance
		 * @protected
		 * @function
		 */
		init: null,
		/**
		 * This method is called from the {@link FooTable.Table#destroy} method.
		 * @instance
		 * @protected
		 */
		destroy: null,
		/**
		 * This method is called from the {@link FooTable.Table#draw} method.
		 * @instance
		 * @protected
		 * @function
		 */
		predraw: null,
		/**
		 * This method is called from the {@link FooTable.Table#draw} method.
		 * @instance
		 * @protected
		 * @function
		 */
		draw: null,
		/**
		 * This method is called from the {@link FooTable.Table#draw} method.
		 * @instance
		 * @protected
		 * @function
		 */
		postdraw: null
	});

	F.components = new F.ClassFactory();
	F.components.core = new F.ClassFactory();
	F.components.internal = new F.ClassFactory();

})(jQuery, FooTable);