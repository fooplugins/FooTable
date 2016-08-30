(function(F){
	/**
	 * An array containing the column options or a jQuery promise that resolves returning the columns. The index of the definitions must match the index of each column as it should appear in the table. For more information on the options available see the {@link FooTable.Column} object.
	 * @type {(Array.<object>|jQuery.Promise)}
	 * @default []
	 * @example <caption>The below shows column definitions for a row defined as <code>{ id: Number, name: String, age: Number }</code>. The ID column has a fixed width, the table is initially sorted on the Name column and the Age column will be hidden on phones.</caption>
	 * columns: [
	 * 	{ name: 'id', title: 'ID', type: 'number' },
	 *	{ name: 'name', title: 'Name', sorted: true, direction: 'ASC' }
	 *	{ name: 'age', title: 'Age', type: 'number', breakpoints: 'xs' }
	 * ]
	 */
	F.Defaults.prototype.columns = [];

	/**
	 * Specifies whether or not the column headers should be displayed.
	 * @type {boolean}
	 * @default true
	 */
	F.Defaults.prototype.showHeader = true;
})(FooTable);