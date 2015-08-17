(function(F){
	/**
	 * An object containing the paging options for the plugin. Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow paging on the table.
	 * @prop {string} countFormat="{CP} of {TP}" - A string format used to generate the page count text.
	 * @prop {number} current=1 - The page number to display.
	 * @prop {number} limit=5 - The maximum number of page links to display at once.
	 * @prop {string} position="center" - The string used to specify the alignment of the pagination control.
	 * @prop {number} size=10 - The number of rows displayed per page.
	 * @prop {object} strings - An object containing the strings used by the paging buttons.
	 * @prop {string} strings.first="&laquo;" - The string used for the 'first' button.
	 * @prop {string} strings.prev="&lsaquo;" - The string used for the 'previous' button.
	 * @prop {string} strings.next="&rsaquo;" - The string used for the 'next' button.
	 * @prop {string} strings.last="&raquo;" - The string used for the 'last' button.
	 * @prop {string} strings.prevPages="..." - The string used for the 'previous X pages' button.
	 * @prop {string} strings.nextPages="..." - The string used for the 'next X pages' button.
	 */
	F.Defaults.prototype.paging = {
		enabled: false,
		countFormat: '{CP} of {TP}',
		current: 1,
		limit: 5,
		position: 'center',
		size: 10,
		strings: {
			first: '&laquo;',
			prev: '&lsaquo;',
			next: '&rsaquo;',
			last: '&raquo;',
			prevPages: '...',
			nextPages: '...'
		}
	};
})(FooTable);