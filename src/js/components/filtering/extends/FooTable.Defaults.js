(function(F){
	/**
	 * An object containing the filtering options for the plugin. Added by the {@link FooTable.Filtering} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow filtering on the table.
	 * @prop {({name: string, query: (string|FooTable.Query), columns: (Array.<string>|Array.<number>|Array.<FooTable.Column>)}|Array.<FooTable.Filter>)} filters - The filters to apply to the current {@link FooTable.Rows#array}.
	 * @prop {number} delay=1200 - The delay in milliseconds before the query is auto applied after a change (any value equal to or less than zero will disable this).
	 * @prop {number} min=1 - The minimum number of characters allowed in the search input before it is auto applied.
	 * @prop {string} space="AND" - Specifies how whitespace in a filter query is handled.
	 * @prop {string} placeholder="Search" - The string used as the placeholder for the search input.
	 * @prop {string} dropdownTitle=null - The title to display at the top of the search input column select.
	 * @prop {string} position="right" - The string used to specify the alignment of the search input.
	 * @prop {string} connectors=true - Whether or not to replace phrase connectors (+.-_) with space before executing the query.
	 * @prop {boolean} ignoreCase=true - Whether or not ignore case when matching.
	 * @prop {boolean} exactMatch=false - Whether or not search queries are treated as phrases when matching.
	 */
	F.Defaults.prototype.filtering = {
		enabled: false,
		filters: [],
		delay: 1200,
		min: 1,
		space: 'AND',
		placeholder: 'Search',
		dropdownTitle: null,
		position: 'right',
		connectors: true,
		ignoreCase: true,
		exactMatch: false
	};
})(FooTable);