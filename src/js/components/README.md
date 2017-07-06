The following lists all default components and the properties they're registered with. The higher the priority the earlier the component 
is loaded by the plugin. When base component methods such as preinit or init are executed the priority also determines the order in 
which they are executed.

| Class Name           | Registered Name | Priority | Required |
|----------------------|-----------------|----------|----------|
| FooTable.Breakpoints | breakpoints     |     1000 | true     |
| FooTable.Columns     | columns         |      900 | true     |
| FooTable.Editing     | editing         |      850 | false    |
| FooTable.Rows        | rows            |      800 | true     |
| FooTable.State       | state           |      700 | false    |
| FooTable.Sorting     | sorting         |      600 | false    |
| FooTable.Filtering   | filtering       |      500 | false    |
| FooTable.Export      | export          |      490 | false    |
| FooTable.Paging      | paging          |      400 | false    |
