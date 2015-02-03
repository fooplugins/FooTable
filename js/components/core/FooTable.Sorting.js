(function ($, FooTable) {

	/**
	 * The sort function for this column. This is set by the plugin.
	 * @type {function}
	 * @default jQuery.noop
	 */
	FooTable.Column.prototype.sorter = null;
	/**
	 * The direction to sort if the {@link FooTable.Column#sorted} property is set to true. Can be "ASC", "DESC" or NULL.
	 * @type {string}
	 * @default null
	 */
	FooTable.Column.prototype.direction = null;
	/**
	 * Whether or not the column can be sorted.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.sortable = true;
	/**
	 * Whether or not the column is sorted.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Column.prototype.sorted = false;

	/**
	 * An object containing the sorting options for the plugin.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow sorting on the table.
	 * @prop {(string|number|FooTable.Column)} column=null - The column to sort on. Can be an instance of FooTable.Column, the name of a column or the index of a column.
	 * @prop {string} direction=null - The direction to sort the column by. Can be "ASC", "DESC" or NULL.
	 */
	FooTable.Defaults.prototype.sorting = {
		enabled: false,
		column: null,
		direction: null
	};

	/**
	 * These sorters are supplied two values from the column and a comparison must be made between them and the result returned.
	 * The name of the sorter must match a {@link FooTable.Column#type} for it to be used automatically by the plugin for those columns.
	 * @summary An object containing the default sorters for the plugin to use.
	 * @type {object.<string, function(HTMLTableCellElement)>}
	 * @default { "text": function, "number": function }
	 * @example <caption>This example shows using pseudo code what a sorter would look like.</caption>
	 * sorters: {
	 *  ...
	 * 	"pseudo": function(a, b){
	 * 		if (a is less than b by some ordering criterion) {
	 * 			return -1;
	 * 		}
	 * 		if (a is greater than b by the ordering criterion) {
	 * 			return 1;
	 * 		}
	 * 		// a must be equal to b
	 * 		return 0;
	 * 	}
	 * }
	 * @example <caption>This example shows how to register a sorter for the custom column type of "example" which is a number.</caption>
	 * sorters: {
	 * 	...
	 * 	"example": function(a, b){
	 * 		return a - b;
	 * 	}
	 * }
	 */
	FooTable.Defaults.prototype.sorters = {
		text: function (a, b) {
			if (typeof(a) === 'string') { a = a.toLowerCase(); }
			if (typeof(b) === 'string') { b = b.toLowerCase(); }
			if (a === b) return 0;
			if (a < b) return -1;
			return 1;
		},
		number: function (a, b) {
			return a - b;
		}
	};

	/**
	 * The name of the column to sort on.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.sortColumn = null;

	/**
	 * The direction to sort the column by. Can be "ASC", "DESC" or NULL.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.sortDirection = null;

	FooTable.Sorting = FooTable.Component.extend(/** @lends FooTable.Sorting */{
		/**
		 * The sorting component adds a small sort button to specified column headers allowing users to sort those columns in the table.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Sorting}
		 */
		ctor: function (instance) {
			this._super(instance);
		},
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.sorter = typeof definition.sorter == 'function' ? definition.sorter : $.noop;
			column.direction = typeof definition.direction == 'string' ? definition.direction : null;
			column.sortable = typeof definition.sortable == 'boolean' ? definition.sortable : true;
			column.sorted = typeof definition.sorted == 'boolean' ? definition.sorted : false;
			if (column.sortable) column.$headerCell.addClass('footable-sortable');
		},
		/**
		 * Initializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_init
		 */
		init: function (table, options) {
			if (this.instance.options.sorting.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_init event is raised after its UI is generated.
			 * @event FooTable.Sorting#sorting_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('sorting_init');
		},
		/**
		 * Reinitializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_reinit
		 */
		reinit: function (table, options) {
			this.destroy();
			if (this.instance.options.sorting.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Sorting#sorting_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('sorting_reinit');
		},
		/**
		 * Destroys the sorting component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.sorting.enabled == false) return;
			this.instance.$table.off('click.footable', '.footable-sortable', this._onSortClicked);
			this.instance.$table.children('thead').children('tr.footable-header')
				.children('.footable-sortable').removeClass('footable-sortable')
				.find('span.direction').remove();
		},
		/**
		 * Appends or updates any sorting specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function (data) {
			if (this.instance.options.sorting.enabled == false) return;
			data.sortColumn = this.instance.options.sorting.column.name;
			data.sortDirection = this.instance.options.sorting.direction;
		},
		/**
		 * Performs the actual sorting against the {@link FooTable.Rows#array}.
		 * @instance
		 */
		predraw: function () {
			if (this.instance.options.sorting.enabled == false || this.instance.options.ajaxEnabled == true || !this.instance.options.sorting.column || !this.instance.options.sorting.direction) return;
			var self = this;
			self.instance.rows.array.sort(function (a, b) {
				return self.instance.options.sorting.direction == 'ASC'
					? self.instance.options.sorting.column.sorter(a.cells[self.instance.options.sorting.column.index].value, b.cells[self.instance.options.sorting.column.index].value)
					: self.instance.options.sorting.column.sorter(b.cells[self.instance.options.sorting.column.index].value, a.cells[self.instance.options.sorting.column.index].value);
			});
		},
		/**
		 * Updates the sorting UI setting the state of the sort buttons.
		 * @instance
		 */
		draw: function () {
			if (this.instance.options.sorting.enabled == false || !this.instance.options.sorting.column || !this.instance.options.sorting.direction) return;
			var $sortable = this.instance.$table.children('thead').children('tr.footable-header').children('.footable-sortable'),
				$active = $sortable.eq(this.instance.options.sorting.column.index);

			$sortable.removeClass('footable-asc footable-desc').children('.glyphicon').removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
			$sortable.not($active).children('.glyphicon').addClass('glyphicon-sort');
			$active.addClass(this.instance.options.sorting.direction == 'ASC' ? 'footable-asc' : 'footable-desc')
				.children('.glyphicon').addClass(this.instance.options.sorting.direction == 'ASC' ? 'glyphicon-sort-by-attributes' : 'glyphicon-sort-by-attributes-alt');
		},
		/**
		 * Generates the sorting UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate UI.
		 * @private
		 */
		_generate: function (options) {
			var self = this;
			options.sorting.column = self.instance.columns.getColumn(options.sorting.column) || self.instance.columns.first(function (col) { return col.sorted; });
			options.sorting.direction = options.sorting.column == null
				? null
				: (options.sorting.direction == null
				? (options.sorting.column.direction == null
				? 'ASC'
				: options.sorting.column.direction)
				: options.sorting.direction);
			self.instance.$table.addClass('footable-sorting').children('thead').children('tr.footable-header').children('th,td').filter(function (i) {
				return self.instance.columns.array[i].sortable == true;
			}).append($('<span/>', {'class': 'glyphicon glyphicon-sort'}));
			self.instance.$table.on('click.footable', '.footable-sortable', { self: self }, self._onSortClicked);
		},
		/**
		 * Handles the sort button clicked event.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onSortClicked: function (e) {
			e.preventDefault();
			var self = e.data.self, $header = $(this).closest('th,td'), direction = 'ASC';
			self.instance.options.sorting.column = self.instance.columns.array[$header.index()];
			self.instance.options.sorting.direction = $header.is('.footable-asc, .footable-desc') ? ($header.hasClass('footable-desc') ? 'ASC' : 'DESC') : direction;
			self.instance.update();
		}
	});

})(jQuery, FooTable = window.FooTable || {});