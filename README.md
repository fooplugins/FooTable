FooTable
========

FooTable is a jQuery plugin that aims to make HTML tables on smaller devices look awesome - No matter how many columns of data you may have in them.

![FooTable](https://raw.github.com/bradvin/FooTable/master/screenshot.jpg "FooTable")

FooTable also now has a sorting and filtering add-on. Footable also works with jQuery 1.4.4 and above!

Index
-----

* [What does it do?](#whatdoesitdo)
* [Demo](#demo)
* [Data Attribute Configuration](#dataattributeconfig)
* [Breakpoints](#breakpoints)
* [Usage](#usage)
* [Extensible](#extensible)
  * [Parsers](#parsers)
* [Thanks](#thanks)

<h2 id="whatdoesitdo">What does it do?</h2>

FooTable transforms your HTML tables into expandable responsive tables. This is how it works:

1. It hides certain columns of data at different resolutions (we call these breakpoints).
2. Rows become expandable to show the data that was hidden.

So simple! So all the data that is hidden can always be seen just by clicking the row.

<h2 id="demo">Demo</h2>

Check out the [FooTable homepage](http://themergency.com/footable/) where we will be adding more demos, including the responsive demo!

<h2 id="dataattributeconfig">Data Attribute Configuration</h2>

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

All available "data-" attributes are listed below with their descriptions. The "Applied To" column specifies whether the attribute should be added to the table header cells or body cells.

<table>
  <tr>
    <th>Name</th>
    <th>Values</th>
    <th>Applied To</th>
    <th>Description</th>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-class</td>
    <td style="white-space:nowrap;">CSS Class</td>
    <td>header</td>
    <td>This specifies a CSS class to be applied to all cells in a column.</td>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-hide</td>
    <td style="white-space:nowrap;"><a href="#breakpoints">breakpoint</a> | default</td>
    <td>header</td>
    <td>This specifies at which breakpoints to hide a column. Seperate multiple using a comma.</td>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-ignore</td>
    <td style="white-space:nowrap;">true | false</td>
    <td>header</td>
    <td>This will stop the column being included in the detail row creation.</td>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-name</td>
    <td style="white-space:nowrap;">String</td>
    <td>header</td>
    <td>This will override the name of the column in the detail row.</td>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-type</td>
    <td style="white-space:nowrap;"><a href="#parsers">parser</a> | alpha</td>
    <td>header</td>
    <td>This specifies the parser to use to retrieve a cell's value.</td>
  </tr>
  <tr>
    <td style="white-space:nowrap;">data-value</td>
    <td style="white-space:nowrap;">Any</td>
    <td>body</td>
    <td>This specifies a value to use other than the text of the cell.</td>
  </tr>
</table>

<h2 id="breakpoints">Breakpoints</h2>

We work with the concepts of "breakpoints", which are different device widths we care about. The default breakpoints are:

```javascript
breakpoints: {
  phone: 480,
  tablet: 1024
}
```

So looking at the markup in the *Data Attribute Configuration* section, you can now tell that the *Job Title*, *DOB* and *Status* columns will be hidden when the screen width is below 480 (phone).

There are also two built-in breakpoints called "default" and "all".

The "default" breakpoint is the fallback breakpoint for when the current screen width is larger than any defined breakpoint. Looking at the above JS snippet the "default" breakpoint would be applied once the screen width is larger than 1024 (tablet).

The last breakpoint "all" is pretty straight forward in it's use. You can always hide a column on any screen width by applying the *data-hide="all"* attribute to the header.

<h2 id="usage">Usage</h2>

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
<script src="js/footable.js" type="text/javascript"></script>
```

And finally, call the FooTable plugin:

```html
<script type="text/javascript">
  $(function() {
    $('.footable').footable();
  });
</script>
```

<h2 id="extensible">Extensible</h2>

Another goal of FooTable was to make it super extensible. If you look at the code you will see that there is a plugin framework within the plugin, so extra mods can be attached just by including another javascript file. We also didn't want to bloat FooTable, so you can only use what you need and leave out everything else. 

Working add-ons:

* sorting
* filtering

Othere add-on ideas so far are:

* conditional formatting
* json loading

<h3 id="parsers">Parsers</h3>

Parsers are the heart of FooTable as data is what we are displaying and working with and due to this they are highly extensible. They are used to retrieve values from cells or alternatively from a "data-value" attribute.
By default there is only an "alpha" parser and this will be used unless a custom parser is implemented and a column is set to use it via the "data-type" attribute.

The below is the very simple "alpha" parser used by default to retrieve a cell's value:

```javascript
alpha: function (cell) {
  return $(cell).data('value') || $.trim($(cell).text());
}
```

The below is an example of a numeric parser and how to apply it (these can be wrapped up in a plugin; see the sortable plugin):

```html
<script type="text/javascript">
  $(function() {
    $('.footable').footable({
      parsers: {
        numeric: function (cell) {
          var val = $(cell).data('value') || $(cell).text().replace(/[^0-9.-]/g, '');
          val = parseFloat(val);
          if (isNaN(val)) val = 0;
          return val;
        }
      }
    });
  });
</script>
```

```html
<table class="footable">
  <thead>
    <tr>
      <th data-type="numeric">
        Count
      </th>
      ...
    </tr>
  </thead>
  ...
```

As you can see in the snippet for the "numeric" parser, like the "alpha" parser, they both check for a "data-value" attribute and will use this value before using a cell's text.

An example of this could look like the below, where you want to display the name of a number instead of the actual value:

```html
<table class="footable">
  <thead>
    <tr>
      <th data-type="numeric">
        Count
      </th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-value="0">Zero</td>
      ...
    </tr>
    <tr>
      <td data-value="1">One</td>
      ...
    </tr>
    ...
  </tbody>
  ...
```

<h2 id="thanks">Thanks</h2>

We would not have created FooTable without inspiration from others. Thanks must be given to:

* Catalin for his [original table CSS](http://www.red-team-design.com/practical-css3-tables-with-rounded-corners)
* [Chris Coyier](http://css-tricks.com/responsive-data-tables/) (also check out Chris' [responsive table roundup post](http://css-tricks.com/responsive-data-table-roundup/))
* [Zurb](http://www.zurb.com/playground/responsive-tables)
* [Dave Bushell](http://dbushell.com/2012/01/05/responsive-tables-2/)
* [Filament Group](http://filamentgroup.com/examples/rwd-table-patterns/)
* [Stewart Curry](http://www.irishstu.com/stublog/2011/12/13/tables-responsive-design-part-2-nchilds/)