(function(F){

	/**
	 * Adds a row to the underlying {@link FooTable.Rows#all} array.
	 * @param {(object|FooTable.Row)} dataOrRow - A hash containing the row values or an actual {@link FooTable.Row} object.
	 */
	F.Rows.prototype.add = function(dataOrRow){
		var row = dataOrRow;
		if (F.is.hash(dataOrRow)){
			row = new FooTable.Row(this.ft, this.ft.columns.array, dataOrRow);
		}
		if (row instanceof FooTable.Row){
			row.add();
		}
	};

	/**
	 * Updates a row in the underlying {@link FooTable.Rows#all} array.
	 * @param {(number|FooTable.Row)} indexOrRow - The index to update or the actual {@link FooTable.Row} object.
	 * @param {object} data - A hash containing the new row values.
	 */
	F.Rows.prototype.update = function(indexOrRow, data){
		var len = this.ft.rows.all.length, 
			row = indexOrRow;
		if (F.is.number(indexOrRow) && indexOrRow >= 0 && indexOrRow < len){
			row = this.ft.rows.all[indexOrRow];
		}
		if (row instanceof FooTable.Row && F.is.hash(data)){
			row.val(data);
		}
	};

	/**
	 * Deletes a row from the underlying {@link FooTable.Rows#all} array.
	 * @param {(number|FooTable.Row)} indexOrRow - The index to delete or the actual {@link FooTable.Row} object.
	 */
	F.Rows.prototype.delete = function(indexOrRow){
		var len = this.ft.rows.all.length, 
			row = indexOrRow;
		if (F.is.number(indexOrRow) && indexOrRow >= 0 && indexOrRow < len){
			row = this.ft.rows.all[indexOrRow];
		}
		if (row instanceof FooTable.Row){
			row.delete();
		}
	};

})(FooTable);
