# Getting Started

### 1. Include FooTable Core CSS

    <link href="path_to_your_css/footable.core.css" rel="stylesheet" type="text/css" />

### 2. [optional] Include FooTable Theme CSS

FooTable is now built to work with [Twitter Bootstrap] out of the box but
you can also use one of our built-in themes if you want:

    <link href="path_to_your_css/themes/footable.standalone.css" rel="stylesheet" type="text/css" />

### 3. Include jQuery

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" type="text/javascript"></script>

### 4. Include FooTable jQuery Plugin

    <script src="path_to_your_js/footable.js" type="text/javascript"></script>

### 5. Initialize FooTable!

    <script type="text/javascript">
    $(function () {
        $('.footable').footable();
    });
    </script>

## Explanantion

### Breakpoints

FooTable works off the concept of breakpoints. These can be customized, but the default breakpoints are

    breakpoints: {
        phone: 480,
        tablet: 1024
    }

To change the breakpoints simply pass in a breakpoints option when initializing FooTable:

    $('.footable').footable({
        breakpoints: {
            tiny: 100,
            medium: 555,
            big: 2048
        }
    });

### Column Setup (using data attributes)

You then need to tell FooTable which columns to hide on which breakpoints,
by specifying data-hide attributes on the table head columns:

    <table class="footable table">
        <thead>
            <tr>
                <th>Name</th>
                <th data-hide="phone">Job Title</th>
                <th data-hide="phone,tablet">Status</th>
                <th data-hide="all">Description</th>
            </tr>
        </thead>

In the above example the following will be true:

<table class="footable table footable-loaded default" data-sort="false">
<thead>
<tr>
<th class="footable-first-column">Column</th>
<th>Data Attribute</th>
<th data-hide="phone,tablet">Shown on Desktop</th>
<th data-hide="phone,tablet">Shown on Tablet</th>
<th data-hide="phone,tablet" class="footable-last-column">Shown on Phone</th>
</tr>
</thead>
<tbody>
<tr>
<td class="footable-first-column"><span class="footable-toggle"></span>Name</td>
<td>[none]</td>
<td><span class="label label-success" title="Active">yes</span></td>
<td><span class="label label-success" title="Active">yes</span></td>
<td class="footable-last-column"><span class="label label-success" title="Active">yes</span></td>
</tr>
<tr>
<td class="footable-first-column"><span class="footable-toggle"></span>Job Title</td>
<td><code>data-hide="phone"</code></td>
<td><span class="label label-success" title="Active">yes</span></td>
<td><span class="label label-success" title="Active">yes</span></td>
<td class="footable-last-column"><span class="label label-danger" title="Active">no</span></td>
</tr>
<tr>
<td class="footable-first-column"><span class="footable-toggle"></span>Status</td>
<td><code>data-hide="phone,tablet"</code></td>
<td><span class="label label-success" title="Active">yes</span></td>
<td><span class="label label-danger" title="Active">no</span></td>
<td class="footable-last-column"><span class="label label-danger" title="Active">no</span></td>
</tr>
<tr>
<td class="footable-first-column"><span class="footable-toggle"></span>Description</td>
<td><code>data-hide="all"</code></td>
<td><span class="label label-danger" title="Active">no</span></td>
<td><span class="label label-danger" title="Active">no</span></td>
<td class="footable-last-column"><span class="label label-danger" title="Active">no</span></td>
</tr>
</tbody>
</table>

You can set a column to always be hidden, by adding data-hide="all" to the
table head column. (Check out the icon styles demo to see this in action)


[Twitter Bootstrap]: http://getbootstrap.com
