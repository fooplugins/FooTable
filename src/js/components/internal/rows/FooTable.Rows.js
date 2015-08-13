(function ($, F) {
	F.Rows = F.Component.extend(/** @lends FooTable.Rows */{
		/**
		 * The rows class contains all the logic for handling rows.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Table} table -  The parent {@link FooTable.Table} this component belongs to.
		 * @returns {FooTable.Rows}
		 */
		construct: function (table) {
			// call the base class constructor
			this._super(table, true);

			/**
			 * This provides a shortcut to the {@link FooTable.Table#options} object.
			 * @instance
			 * @protected
			 * @type {FooTable.Table#options}
			 */
			this.o = table.o;
			/**
			 * The current working array of {@link FooTable.Row} objects.
			 * @instance
			 * @protected
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 */
			this.array = [];
			/**
			 * The base array of rows parsed from either the DOM or the constructor options.
			 * The {@link FooTable.Rows#current} member is populated with a shallow clone of this array
			 * during the predraw operation before any core or custom components are executed.
			 * @instance
			 * @protected
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 */
			this.all = [];
			/**
			 * Whether or not to display a toggle in each row when it contains hidden columns.
			 * @type {boolean}
			 * @default true
			 */
			this.showToggle = table.o.showToggle;
			/**
			 * Specifies which column the row toggle is appended to. Supports only two values; "first" and "last"
			 * @type {string}
			 */
			this.toggleColumn = table.o.toggleColumn;
			/**
			 * The text to display when the table has no rows.
			 * @type {string}
			 */
			this.emptyString = table.o.empty;
			/**
			 * Whether or not the first rows details are expanded by default when displayed on a device that hides any columns.
			 * @type {boolean}
			 */
			this.expandFirst = table.o.expandFirst;
			/**
			 * The jQuery object that contains the empty row control.
			 * @type {jQuery}
			 */
			this.$empty = null;
		},
		/**
		 * This parses the rows from either the tables rows or the supplied options.
		 * @instance
		 * @protected
		 * @returns {jQuery.Promise}
		 */
		parse: function(){
			var self = this;
			return $.Deferred(function(d){
				var $rows = self.ft.$el.children('tbody').children('tr');
				function complete(rows){
					var result = $.map(rows, function(r){
						return new F.Row(self.ft, self.ft.columns.array, r);
					});
					if (F.is.emptyArray(result)){
						d.reject(Error("No rows supplied."));
					} else {
						d.resolve(result);
					}
				}
				if (F.is.jq($rows)){
					complete($rows);
				} else if (F.is.array(self.o.rows) && self.o.rows.length > 0){
					complete(self.o.rows);
				} else if (F.is.promise(self.o.rows)){
					self.o.rows.then(function(rows){
						complete(rows);
					}, function(xhr){
						d.reject(Error('Rows ajax request error: ' + xhr.status + ' (' + xhr.statusText + ')'));
					});
				} else {
					complete([]);
				}
			});
		},
		/**
		 * The columns preinit method is used to parse and check the column options supplied from both static content and through the constructor.
		 * @instance
		 * @protected
		 * @param {object} data - The jQuery data object from the root table element.
		 * @fires FooTable.Rows#"preinit.ft.rows"
		 */
		preinit: function(data){
			var self = this;
			/**
			 * The preinit.ft.rows event is raised before any UI is created and provides the tables jQuery data object for additional options parsing.
			 * Calling preventDefault on this event will disable the entire plugin.
			 * @event FooTable.Rows#"preinit.ft.rows"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 * @param {object} data - The jQuery data object of the table raising the event.
			 */
			return self.ft.raise('preinit.ft.rows', [data]).then(function(){
				return self.parse().then(function(rows){
					self.all = rows;
					self.array = self.all.slice(0);
					self.showToggle = F.is.boolean(data.showToggle) ? data.showToggle : self.showToggle;
					self.toggleColumn = F.is.string(data.toggleColumn) ? data.toggleColumn : self.toggleColumn;
					if (self.toggleColumn != "first" && self.toggleColumn != "last") self.toggleColumn = "first";
					self.emptyString = F.is.string(data.empty) ? data.empty : self.emptyString;
					self.expandFirst = F.is.boolean(data.expandFirst) ? data.expandFirst : self.expandFirst;
				});
			});
		},
		/**
		 * Initializes the rows class using the supplied table and options.
		 * @instance
		 * @protected
		 * @fires FooTable.Rows#"init.ft.rows"
		 */
		init: function () {
			var self = this;
			/**
			 * The init.ft.rows event is raised after the the rows are parsed from either the DOM or the options.
			 * Calling preventDefault on this event will disable the entire plugin.
			 * @event FooTable.Rows#"init.ft.rows"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the DOM or the options.
			 */
			return self.ft.raise('init.ft.rows', [self.all]).then(function(){
				self.$empty = $('<tr/>', { 'class': 'footable-empty' }).append($('<td/>').text(self.emptyString));
			});
		},
		/**
		 * Performs the predraw operations that are required including creating the shallow clone of the {@link FooTable.Rows#array} to work with.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			F.arr.each(this.array, function(row){
				row.predraw();
			});
			this.array = this.all.slice(0);
		},
		/**
		 * Performs the actual drawing of the table rows.
		 * @instance
		 * @protected
		 */
		draw: function(){
			var self = this, $tbody = self.ft.$el.children('tbody'), first = true;
			// if we have rows
			if (self.array.length > 0){
				self.$empty.detach();
				// loop through them appending to the tbody and then drawing
				F.arr.each(self.array, function(row){
					if (self.expandFirst && first){
						row.expanded = true;
						first = false;
					}
					row.draw($tbody);
				});
			} else {
				// otherwise display the $empty row
				self.$empty.children('td').attr('colspan', self.ft.columns.visibleColspan);
				$tbody.append(self.$empty);
			}
		}
	});

	F.components.internal.register('rows', F.Rows, 0);

})(jQuery, FooTable);