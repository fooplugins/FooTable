To allow FooTable to use an ajax request to handle there are a few steps you should do.

1. Create an endpoint using what ever language you are comfortable with that can handle the {@link FooTable.RequestData} object and return a JSON object containing the properties of a {@link FooTable.ResponseData} object. This endpoint will need to inspect the {@link FooTable.RequestData} values and perform the required sorting, filtering or paging operations. The {@link FooTable.ResponseData#rows} array should only contain the rows for the current page, so if your page size is set to 10, then you should return 10 rows. The {@link FooTable.ResponseData#totalRows} should contain the count of the total number of rows available, not just the 10 returned due to the page size.

2. Include the required files in your page.
```html
<link href="footable.min.css" rel="stylesheet"/>
<script src="footable.min.js"></script>
```

3. Configure the plugin to use the {@link FooTable.Defaults#ajax} callback and the components you require.
```javascript
<script>
	jQuery(function($){
		$('table').footable({
			...
			ajaxEnabled: true,
			sorting: {
				enabled: true
			},
			filtering: {
				enabled: true
			},
			paging: {
				enabled: true,
				size: 15
			}
			...
		});
	});
</script>
```

4. Create a function to handle the {@link FooTable.Defaults#ajax} callback. This function will be passed an instance of {@link FooTable.RequestData} which you can use to query the server and let it perform the heavy lifting of the sorting, filtering, etc.
```javascript
<script>
	jQuery(function($){
		$('table').footable({
			...
			ajax: function(requestData){
				return $.ajax({
					url: 'http://example.com/my-endpoint',
					data: requestData
				});
			}
			...
		});
	});
</script>
```

5. Define the columns that will be created using the {@link FooTable.ResponseData#rows} array. Take a look at the {@link FooTable.Column} object to see what properties are supported. In the below example each row is defined as an object like: `{ id: Number, name: String, age: Number }`.
```javascript
<script>
	jQuery(function($){
		$('table').footable({
			...
			columns: {
				0: { name: 'id', title: 'ID', width: 80, type: 'number' },
				1: { name: 'name', title: 'Name', sorted: true, direction: 'ASC' }
				2: { name: 'age', title: 'Age', type: 'number', hide: 'phone' }
			}
			...
		});
	});
</script>
```

----------
## Summary ##

So in the end to have an ajax enabled FooTable the initialize code would look something like the below:

```javascript
<script>
	jQuery(function($){
		$('table').footable({
			ajaxEnabled: true,
			sorting: {
				enabled: true
			},
			filtering: {
				enabled: true
			},
			paging: {
				enabled: true,
				size: 15
			},
			ajax: function(requestData){
				return $.ajax({
					url: 'http://example.com/my-endpoint',
					data: requestData
				});
			},
			columns: {
				0: { name: 'id', title: 'ID', width: 80, type: 'number' },
				1: { name: 'name', title: 'Name', sorted: true, direction: 'ASC' }
				2: { name: 'age', title: 'Age', type: 'number', hide: 'phone' }
			}
		});
	});
</script>
```

And the endpoint at http://example.com/my-endpoint would need to return a JSON object with the below {@link FooTable.ResponseData} properties:

```javascript
{
	"totalRows": Number, // The total number of rows in the database.
	"rows": Array // An array of JSON objects as defined in the columns option.
}
```