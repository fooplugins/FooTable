FooTable
========

FooTable is a jQuery plugin that aims to make HTML tables on smaller devices look awesome - No matter how many columns of data you may have in them.

![FooTable](https://raw.github.com/bradvin/FooTable/master/screenshot.jpg "FooTable")

FooTable also now has a sorting and filtering add-on. Footable also works with jQuery 1.4.4 and above!

What Does It Do?
----------------
FooTable transforms your HTML tables into expandable responsive tables. This is how it works:

1. It hides certain columns of data at different resolutions (we call these breakpoints).
2. Rows become expandable to show the data that was hidden.

So simple! So all the data that is hidden can always be seen just by clicking the row.

Demo
----
Check out the [FooTable homepage](http://themergency.com/footable/) where we will be adding more demos, including the responsive demo!


Config via Data Attributes
--------------------------
One of the main goals of FooTable was to make it completely configurable via data attributes inside the table. We wanted you to be able to look at the HTML markup and see exactly how the FooTable was going to function. Take a look at this markup for example:

```html
<table class="footable">
  <thead>
    <tr>
      <th data-class="expand">
        First Name
      </th>
      <th>
        Last Name
      </th>
      <th data-hide="phone,tablet">
        Job Title
      </th>
      <th data-hide="phone,tablet">
        DOB
      </th>
      <th data-hide="phone">
        Status
      </th>
    </tr>
  </thead>
```

So you can immediately see that certain columns will be hidden on phones and tablets. We are also going to assign all cells in the first column with a class of "expand" - this is used to style the cool plus/minus icons in the demo.

Breakpoints
-----------
We work with the concepts of "breakpoints", which are different device widths we care about. The default breakpoints are:

```javascript
breakpoints: {
  phone: 480,
  tablet: 1024
}
```

So looking at the above markup, you can now tell that the "Status" column will be hidden when the screen width is below 480 (phone).

Usage
-----
Create a simple table (don't forget to set the data attributes for each column!):

```html
<table class="footable">
  <thead>
    <tr>
      <th>Name</th>
      <th data-hide="phone,tablet">Phone</th>
      <th data-hide="phone,tablet">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bob Builder</td>
      <td>555-12345</td>
      <td>bob@home.com</td>
    </tr>
    <tr>
      <td>Bridget Jones</td>
      <td>544-776655</td>
      <td>bjones@mysite.com</td>
    </tr>
    <tr>
      <td>Tom Cruise</td>
      <td>555-99911</td>
      <td>cruise1@crazy.com</td>
    </tr>
  </tbody>
</table>
```

Then include the FooTable CSS and JS in your page head:

```html
<link href="css/footable-0.1.css" rel="stylesheet" type="text/css" />
<!-- obviously you have jQuery already included -->
<script src="js/footable-0.1.js" type="text/javascript"></script>
```

And finally, call the FooTable plugin:

```html
<script type="text/javascript">
  $(function() {
    $('.footable').footable();
  });
</script>
```

Extensible
----------
Another goal of FooTable was to make it super extensible. If you look at the code you will see that there is a plugin framework within the plugin, so extra mods can be attached just by including another javascript file. We also didn't want to bloat FooTable, so you can only use what you need and leave out everything else. 

Working add-ons:

* sorting
* filtering

Othere add-on ideas so far are:

* conditional formatting
* json loading

Thanks
------
We would not have created FooTable without inspiration from others. Thanks must be given to:

* Catalin for his [original table CSS](http://www.red-team-design.com/practical-css3-tables-with-rounded-corners)
* [Chris Coyier](http://css-tricks.com/responsive-data-tables/) (also check out Chris' [responsive table roundup post](http://css-tricks.com/responsive-data-table-roundup/))
* [Zurb](http://www.zurb.com/playground/responsive-tables)
* [Dave Bushell](http://dbushell.com/2012/01/05/responsive-tables-2/)
* [Filament Group](http://filamentgroup.com/examples/rwd-table-patterns/)
* [Stewart Curry](http://www.irishstu.com/stublog/2011/12/13/tables-responsive-design-part-2-nchilds/)