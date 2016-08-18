(function($, F){

	F.EditingColumn = F.Column.extend(/** @lends FooTable.EditingColumn */{
		/**
		 * The Editing column class is used to create the column containing the editing buttons.
		 * @constructs
		 * @extends FooTable.Column
		 * @param {FooTable.Table} instance -  The parent {@link FooTable.Table} this column belongs to.
		 * @param {FooTable.Editing} editing - The parent {@link FooTable.Editing} component this column is used with.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 * @returns {FooTable.EditingColumn}
		 */
		construct: function(instance, editing, definition){
			this._super(instance, definition, 'editing');
			this.editing = editing;
		},
		/**
		 * After the column has been defined this ensures that the $el property is a jQuery object by either creating or updating the current value.
		 * @instance
		 * @protected
		 * @this FooTable.Column
		 */
		$create: function(){
			(this.$el = !this.virtual && F.is.jq(this.$el) ? this.$el : $('<th/>', {'class': 'footable-editing'})).html(this.title);
		},
		/**
		 * This is supplied either the cell value or jQuery object to parse. Any value can be returned from this method and
		 * will be provided to the {@link FooTable.EditingColumn#format} function
		 * to generate the cell contents.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or jQuery cell object.
		 * @returns {(jQuery)}
		 */
		parser: function(valueOrElement){
			if (F.is.string(valueOrElement)) valueOrElement = $($.trim(valueOrElement));
			if (F.is.element(valueOrElement)) valueOrElement = $(valueOrElement);
			if (F.is.jq(valueOrElement)){
				var tagName = valueOrElement.prop('tagName').toLowerCase();
				if (tagName == 'td' || tagName == 'th') return valueOrElement.data('value') || valueOrElement.contents();
				return valueOrElement;
			}
			return null;
		},
		/**
		 * Creates a cell to be used in the supplied row for this column.
		 * @param {FooTable.Row} row - The row to create the cell for.
		 * @returns {FooTable.Cell}
		 */
		createCell: function(row){
			var $buttons = this.editing.$rowButtons(), $cell = $('<td/>').append($buttons);
			if (F.is.jq(row.$el)){
				if (this.index === 0){
					$cell.prependTo(row.$el);
				} else {
					$cell.insertAfter(row.$el.children().eq(this.index-1));
				}
			}
			return new F.Cell(this.ft, row, this, $cell || $cell.html());
		}
	});

	F.columns.register('editing', F.EditingColumn);

})(jQuery, FooTable);