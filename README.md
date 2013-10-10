FooTable
========

FooTable is a jQuery plugin that aims to make HTML tables on smaller devices look awesome - No matter how many columns of data you may have in them.

[Home Page](http://fooplugins.com/plugins/footable-jquery "Visit the FooTable Homepage") |
[WordPress Plugin (free)](http://fooplugins.com/plugins/footable-lite/) |
[Demos](http://fooplugins.com/footable-demos/)

![FooTable](https://raw.github.com/bradvin/FooTable/V2/screenshot.jpg "FooTable")

Features
--------

* Hide certain columns at different sizes
* Configuration via data attributes
* Built to work with Bootstrap
* Easy to theme
* Sorting
* Filtering
* Pagination
* Easy to extend with add-ons

What Is FooTable?
-----------------

FooTable is a jQuery plugin that transforms your HTML tables into expandable responsive tables. This is how it works:

1. It hides certain columns of data at different resolutions (we call these breakpoints).
2. Rows become expandable to reveal any hidden data.

So simple! Any hidden data can always be seen just by clicking the row.

Demos
-----

Check out the growing number of [FooTable demos](http://fooplugins.com/footable-demos/) (with built-in documentation!)

Documentation
-------------

The docs are built into the [demos](http://fooplugins.com/footable-demos/)! On every demo page, there is a docs tab that outlines how to use the specific feature.

Data Attribute Configuration
----------------------------

One of the main goals of FooTable was to make it completely configurable via data attributes. We wanted you to be able to look at the HTML markup and see exactly how the FooTable was going to function. Take a look at this markup for example:

```html
<table class="footable" data-filter="#filter" data-page-size="5">
  <thead>
    <tr>
      <th data-toggle="true">
        First Name
      </th>
      <th data-sort-ignore="true">
        Last Name
      </th>
      <th data-hide="phone,tablet">
        Job Title
      </th>
      <th data-hide="phone,tablet" data-name="Date Of Birth">
        DOB
      </th>
      <th data-hide="phone">
        Status
      </th>
    </tr>
  </thead>
```

All available data attributes are listed in the [data attributes demo](http://fooplugins.com/footable-demos/?url=http://fooplugins.com/footable/demos/data-attributes.htm)

Breakpoints
-----------

FooTable works with the concepts of "breakpoints", which are different table widths we care about. The default breakpoints are:

```javascript
breakpoints: {
  phone: 480,
  tablet: 1024
}
```

So looking at the markup in the *Data Attribute Configuration* section, you can now tell that the *Job Title*, *DOB* and *Status* columns will be hidden when the table width is below 480 (phone).

There are also two built-in breakpoints called "default" and "all".

The "default" breakpoint is the fallback breakpoint for when the current table width is larger than any defined breakpoint. Looking at the above JS snippet the "default" breakpoint would be applied once the table width is larger than 1024 (tablet).

The "all" breakpoint is pretty straight forward in it's use. You can always hide a column on any table width by applying the *data-hide="all"* attribute to the header.

Usage
-----

Create a simple table (don't forget to set the data attributes for each column in your thead!):

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

1. **Include FooTable Core CSS**

   ```html
<link href="path_to_your_css/footable.core.css" rel="stylesheet" type="text/css" />
```

2. **[optional] Include FooTable Theme CSS**

   > FooTable is now built to work with [Twitter Bootstrap](http://twitter.github.io/bootstrap) out of the box - WOOT!

   You can use one of our built-in themes if you want:

   ```html
<link href="path_to_your_css/footable.metro.css" rel="stylesheet" type="text/css" />
```

   Check out the [metro theme demo](http://fooplugins.com/footable-demos/?url=http://fooplugins.com/footable/demos/metro-theme.htm) or the [original theme demo](http://fooplugins.com/footable-demos/?url=http://fooplugins.com/footable/demos/old-theme.htm).

3. **Include jQuery**

    ```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" type="text/javascript"></script>
```

4. **Include FooTable jQuery Plugin**

    ```html
<script src="path_to_your_js/footable.js" type="text/javascript"></script>
```

5. **Initialize FooTable!**

   ```html
<script type="text/javascript">
    $(function () {

        $('.footable').footable();

    });
</script>
```

Extensible
----------

Another goal of FooTable was to make it easily extensible. If you look at the code you will see that there is a plugin framework within the plugin, so extra mods can be attached just by including another javascript file.

We also didn't want to bloat FooTable, so you can only use what you need and leave out everything else.

Working add-ons:

* sorting
* filtering
* pagination (thanks @awc737)
* striping (thanks @OliverRC)

Other add-on ideas so far are:

* conditional formatting
* json loading
* column picker

Thanks
------

We would not have created FooTable without inspiration from others. Thanks must be given to:

* Catalin for his [original table CSS](http://www.red-team-design.com/practical-css3-tables-with-rounded-corners)
* [@awc737](https://github.com/awc737) for creating the pagination add-on
* [@OliverRC](https://github.com/OliverRC) for creating the striping add-on
* [Chris Coyier](http://css-tricks.com/responsive-data-tables/) (also check out Chris' [responsive table roundup post](http://css-tricks.com/responsive-data-table-roundup/))
* [Zurb](http://www.zurb.com/playground/responsive-tables)
* [Dave Bushell](http://dbushell.com/2012/01/05/responsive-tables-2/)
* [Filament Group](http://filamentgroup.com/examples/rwd-table-patterns/)
* [Stewart Curry](http://www.irishstu.com/stublog/2011/12/13/tables-responsive-design-part-2-nchilds/)
