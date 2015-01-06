(function ($, FooTable) {

	FooTable.Component = FooTable.Class.extend(/** @lends FooTable.Component */{
		/**
		 * The base class for all FooTable components.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @throws {TypeError} The instance parameter must be an instance of {@link FooTable.Instance}.
		 * @returns {FooTable.Component}
		 */
		ctor: function (instance) {
			if (!(instance instanceof FooTable.Instance))
				throw new TypeError('The instance parameter must be an instance of FooTable.Instance.');

			/**
			 * The parent {@link FooTable.Instance} for the component.
			 * @type {FooTable.Instance}
			 */
			this.instance = instance;
		},
		/**
		 * The construct method called from within the {@link FooTable.Cell} constructor.
		 * @instance
		 * @param {FooTable.Cell} cell - The cell object being constructed.
		 */
		ctor_cell: function(cell){},
		/**
		 * The construct method called from within the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 */
		ctor_column: function(column, definition){},
		/**
		 * The construct method called from within the {@link FooTable.Row} constructor.
		 * @instance
		 * @param {FooTable.Row} row - The row object being constructed.
		 */
		ctor_row: function(row){},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance}'s constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		preinit: function (element, options) {},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance} constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		init: function (element, options) {},
		/**
		 * The reinitialize method called from the {@link FooTable.Instance#reinit} method.
		 * @instance
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		reinit: function (options) {},
		/**
		 * This method is called from the {@link FooTable.Instance#destroy} method.
		 * @instance
		 */
		destroy: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 */
		preajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 */
		postajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		predraw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		draw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		postdraw: function () {}
	});

})(jQuery, FooTable = window.FooTable || {});