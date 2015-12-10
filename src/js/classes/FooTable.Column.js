(function($, F){

	F.Column = F.Class.extend(/** @lends FooTable.Column */{
		/**
		 * The column class containing all the properties for columns. All members marked as "readonly" should not be used when defining {@link FooTable.Defaults#columns}.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Table} instance -  The parent {@link FooTable.Table} this component belongs to.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 * @param {string} [type] - The type of column, "text" by default.
		 * @returns {FooTable.Column}
		 * @this FooTable.Column
		 */
		construct: function(instance, definition, type){
			/**
			 * The root {@link FooTable.Table} for the column.
			 * @instance
			 * @readonly
			 * @type {FooTable.Table}
			 */
			this.ft = instance;
			/**
			 * The type of data displayed by the column.
			 * @instance
			 * @readonly
			 * @type {string}
			 */
			this.type = F.is.emptyString(type) ? 'text' : type;
			/**
			 * Whether or not the column was parsed from a standard table row containing data instead of from an actual header row.
			 * @instance
			 * @readonly
			 * @type {boolean}
			 */
			this.virtual = F.is.boolean(definition.virtual) ? definition.virtual : false;
			/**
			 * The jQuery cell object for the column header.
			 * @instance
			 * @readonly
			 * @type {jQuery}
			 */
			this.$el = F.is.jq(definition.$el) ? definition.$el : null;
			/**
			 * The index of the column in the table. This is set by the plugin during initialization.
			 * @instance
			 * @readonly
			 * @type {number}
			 * @default -1
			 */
			this.index = F.is.number(definition.index) ? definition.index : -1;
			this.define(definition);
			this.$create();
		},
		/**
		 * This is supplied the column definition in the form of a simple object created by merging options supplied via the plugin constructor with those parsed from the DOM.
		 * @instance
		 * @protected
		 * @param {object} definition - The object containing the column definition.
		 * @this FooTable.Column
		 */
		define: function(definition){
			/**
			 * Whether or not this column is hidden from view and appears in the details row.
			 * @type {boolean}
			 * @default false
			 */
			this.hidden = F.is.boolean(definition.hidden) ? definition.hidden : false;
			/**
			 * Whether or not this column is completely hidden from view and will not appear in the details row.
			 * @type {boolean}
			 * @default true
			 */
			this.visible = F.is.boolean(definition.visible) ? definition.visible : true;

			/**
			 * The name of the column. This name must correspond to the property name of the JSON row data.
			 * @type {string}
			 * @default null
			 */
			this.name = F.is.string(definition.name) ? definition.name : null;
			if (this.name == null) this.name = 'col'+(definition.index+1);
			/**
			 * The title to display in the column header, this can be HTML.
			 * @type {string}
			 * @default null
			 */
			this.title = F.is.string(definition.title) ? definition.title : null;
			if (!this.virtual && this.title == null && F.is.jq(this.$el)) this.title = this.$el.html();
			if (this.title == null) this.title = 'Column '+(definition.index+1);
			/**
			 * The styles to apply to all cells in this column.
			 * @type {object}
			 */
			this.style = F.is.hash(definition.style) ? definition.style : (F.is.string(definition.style) ? F.css2json(definition.style) : {});
			/**
			 * The classes to apply to all cells in this column.
			 * @type {Array.<string>}
			 */
			this.classes = F.is.array(definition.classes) ? definition.classes : (F.is.string(definition.classes) ? definition.classes.match(/\S+/g) : []);

			// override any default functions ensuring when they are executed "this" within the context of the function points to the instance of this object.
			this.parser = F.checkFnValue(this, definition.parser, this.parser);
			this.formatter = F.checkFnValue(this, definition.formatter, this.formatter);
		},
		/**
		 * After the column has been defined this ensures that the $el property is a jQuery object by either creating or updating the current value.
		 * @instance
		 * @protected
		 * @this FooTable.Column
		 */
		$create: function(){
			(this.$el = !this.virtual && F.is.jq(this.$el) ? this.$el : $('<th/>')).html(this.title);
		},
		/**
		 * This is supplied either the cell value or jQuery object to parse. Any value can be returned from this method and will be provided to the {@link FooTable.Column#format} function
		 * to generate the cell contents.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or jQuery cell object.
		 * @returns {string}
		 * @this FooTable.Column
		 */
		parser: function(valueOrElement){
			if (F.is.element(valueOrElement) || F.is.jq(valueOrElement)) return $(valueOrElement).data('value') || $(valueOrElement).text(); // use jQuery to get the value
			if (F.is.defined(valueOrElement) && valueOrElement != null) return valueOrElement+''; // use the native toString of the value
			return null; // otherwise we have no value so return null
		},
		/**
		 * This is supplied the value retrieved from the {@link FooTable.Column#parse} function and must return a string, HTMLElement or jQuery object.
		 * The return value from this function is what is displayed in the cell in the table.
		 * @instance
		 * @protected
		 * @param {string} value - The value to format.
		 * @returns {(string|HTMLElement|jQuery)}
		 * @this FooTable.Column
		 */
		formatter: function(value){
			return value == null ? '' : value;
		},
		/**
		 * Creates a cell for this column from the supplied {@link FooTable.Row} object. This allows different column types to return different types of cells.
		 * @instance
		 * @protected
		 * @param {FooTable.Row} row - The row to create the cell from.
		 * @returns {FooTable.Cell}
		 * @this FooTable.Column
		 */
		createCell: function(row){
			var element = F.is.jq(row.$el) ? row.$el.children('td,th').get(this.index) : null,
				data = F.is.hash(row.value) ? row.value[this.name] : null;
			return new F.Cell(this.ft, row, this, element || data);
		}
	});

	F.columns = new F.ClassFactory();

	F.columns.register('text', F.Column);

})(jQuery, FooTable);