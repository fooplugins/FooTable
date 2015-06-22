(function ($, FooTable) {

	/**
	 * The sort function for this column. This is set by the plugin. Added by the {@link FooTable.Sorting} component.
	 * @type {function}
	 * @default jQuery.noop
	 */
	FooTable.Column.prototype.sorter = null;
	/**
	 * The direction to sort if the {@link FooTable.Column#sorted} property is set to true. Can be "ASC", "DESC" or NULL. Added by the {@link FooTable.Sorting} component.
	 * @type {string}
	 * @default null
	 */
	FooTable.Column.prototype.direction = null;
	/**
	 * Whether or not the column can be sorted. Added by the {@link FooTable.Sorting} component.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.sortable = true;
	/**
	 * Whether or not the column is sorted. Added by the {@link FooTable.Sorting} component.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Column.prototype.sorted = false;

	/**
	 * An object containing the sorting options for the plugin. Added by the {@link FooTable.Sorting} component.
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
	 * Added by the {@link FooTable.Sorting} component.
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
	 * The name of the column to sort on. Added by the {@link FooTable.Sorting} component.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.sortColumn = null;

	/**
	 * The direction to sort the column by. Can be "ASC", "DESC" or NULL. Added by the {@link FooTable.Sorting} component.
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

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[sorting]{@link FooTable.Defaults#sorting} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.sorting;

			/* PRIVATE */
			/**
			 * Sets a flag indicating whether or not the sorting has changed. When set to true the {@link FooTable.Sorting#sorting_changing} and {@link FooTable.Sorting#sorting_changed} events
			 * will be raised during the drawing operation.
			 * @private
			 * @type {boolean}
			 */
			this._changed = false;

			// call the constructor of the base class
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.sorter = FooTable.is.fn(definition.sorter) ? definition.sorter : $.noop;
			column.direction = FooTable.is.type(definition.direction, 'string') ? definition.direction : null;
			column.sortable = FooTable.is.boolean(definition.sortable) ? definition.sortable : true;
			column.sorted = FooTable.is.boolean(definition.sorted) ? definition.sorted : false;
			if (column.sortable) column.$el.addClass('footable-sortable');
		},
		/**
		 * Initializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_init
		 */
		init: function (table, options) {
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_init event is raised after its UI is generated.
			 * @event FooTable.Sorting#sorting_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('sorting_init');
		},
		/**
		 * Reinitializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_reinit
		 */
		reinit: function (table, options) {
			this.destroy();
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Sorting#sorting_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('sorting_reinit');
		},
		/**
		 * Destroys the sorting component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			this.ft.$table.off('click.footable', '.footable-sortable', this._onSortClicked);
			this.ft.$table.children('thead').children('tr.footable-header')
				.children('.footable-sortable').removeClass('footable-sortable')
				.find('span.direction').remove();
		},
		/**
		 * Appends or updates any sorting specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @protected
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function (data) {
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanging();
			data.sortColumn = this.o.column.name;
			data.sortDirection = this.o.direction;
		},
		/**
		 * Performs the actual sorting against the {@link FooTable.Rows#array}.
		 * @instance
		 * @protected
		 */
		predraw: function () {
			if (this.o.enabled == false
				|| this.ft.options.ajaxEnabled == true)
				return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			if (!self.o.column
				|| !self.o.direction)
				return;

			self.ft.rows.array.sort(function (a, b) {
				return self.o.direction == 'ASC'
					? self.o.column.sorter(a.cells[self.o.column.index].value, b.cells[self.o.column.index].value)
					: self.o.column.sorter(b.cells[self.o.column.index].value, a.cells[self.o.column.index].value);
			});
		},
		/**
		 * Updates the sorting UI setting the state of the sort buttons.
		 * @instance
		 * @protected
		 */
		draw: function () {
			if (this.o.enabled == false || !this.o.column || !this.o.direction) return;
			var self = this,
				$sortable = self.ft.$table.children('thead').children('tr.footable-header').children('.footable-sortable'),
				$active = self.o.column.$el;

			$sortable.removeClass('footable-asc footable-desc').children('.glyphicon').removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
			$sortable.not($active).children('.glyphicon').addClass('glyphicon-sort');
			$active.addClass(self.o.direction == 'ASC' ? 'footable-asc' : 'footable-desc')
				.children('.glyphicon').addClass(self.o.direction == 'ASC' ? 'glyphicon-sort-by-attributes' : 'glyphicon-sort-by-attributes-alt');
		},
		/**
		 * Performs any post draw operations required for sorting.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Raises the sorting_changing event using the column and direction to generate a {@link FooTable.Sorter} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Sorting#sorting_changing
		 */
		raiseChanging: function(){
			var sorter = new FooTable.Sorter(this.o.column, this.o.direction);
			/**
			 * The sorting_changing event is raised before a sort is applied and allows listeners to modify the sorter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Sorting#sorting_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Sorter} sorter - The sorter that is about to be applied.
			 */
			if (this._changed == true && this.ft.raise('sorting_changing', [sorter]).isDefaultPrevented()) return $.when();
			this.o.column = this.ft.columns.get(sorter.column);
			this.o.direction = FooTable.is.type(sorter.direction, 'string') && (sorter.direction == 'ASC' || sorter.direction == 'DESC') ? sorter.direction : 'ASC';
		},
		/**
		 * Raises the sorting_changed event using the column and direction to generate a {@link FooTable.Sorter} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Sorting#sorting_changed
		 */
		raiseChanged: function(){
			/**
			 * The sorting_changed event is raised after a sorter has been applied.
			 * @event FooTable.Sorting#sorting_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Sorter} sorter - The sorter that has been applied.
			 */
			this.ft.raise('sorting_changed', [new FooTable.Sorter(this.o.column, this.o.direction)]);
		},

		/* PUBLIC */
		/**
		 * Sets the sorting options and calls the {@link FooTable.Instance#update} method to perform the actual sorting.
		 * @instance
		 * @param {(string|number|FooTable.Column)} column - The column name, index or the actual {@link FooTable.Column} object to sort by.
		 * @param {string} [direction="ASC"] - The direction to sort by, either ASC or DESC.
		 * @fires FooTable.Sorting#sorting_changing
		 * @fires FooTable.Sorting#sorting_changed
		 */
		sort: function(column, direction){
			var self = this;
			self.o.column = self.ft.columns.get(column);
			self.o.direction = FooTable.is.type(direction, 'string') && (direction == 'ASC' || direction == 'DESC') ? direction : 'ASC';
			self._changed = true;
			return this.ft.update();
		},

		/* PRIVATE */
		/**
		 * Generates the sorting UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate UI.
		 */
		_generate: function (options) {
			var self = this;
			options.sorting.column = self.ft.columns.get(options.sorting.column) || self.ft.columns.first(function (col) { return col.sorted; });
			options.sorting.direction = options.sorting.column == null
				? null
				: (options.sorting.direction == null
					? (options.sorting.column.direction == null
						? 'ASC'
						: options.sorting.column.direction)
					: options.sorting.direction);
			self.ft.$table.addClass('footable-sorting').children('thead').children('tr.footable-header').children('th,td').filter(function (i) {
				return self.ft.columns.array[i].sortable == true;
			}).append($('<span/>', {'class': 'glyphicon glyphicon-sort'}));
			self.ft.$table.on('click.footable', '.footable-sortable', { self: self }, self._onSortClicked);
		},
		/**
		 * Handles the sort button clicked event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onSortClicked: function (e) {
			e.preventDefault();
			var self = e.data.self, $header = $(this).closest('th,td'),
				direction = $header.is('.footable-asc, .footable-desc')
					? ($header.hasClass('footable-desc') ? 'ASC' : 'DESC')
					: 'ASC';
			self.sort($header.index(), direction);
		}
	});

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Sort the table using the specified column and direction. Added by the {@link FooTable.Sorting} component.
	 * @instance
	 * @param {(string|number|FooTable.Column)} column - The column name, index or the actual {@link FooTable.Column} object to sort by.
	 * @param {string} [direction="ASC"] - The direction to sort by, either ASC or DESC.
	 * @fires FooTable.Sorting#sorting_changing
	 * @fires FooTable.Sorting#sorting_changed
	 * @see FooTable.Sorting#sort
	 */
	FooTable.Instance.prototype.sort = function(column, direction){
		return this.use(FooTable.Sorting).sort(column, direction);
	};

})(jQuery, FooTable = window.FooTable || {});