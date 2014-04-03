---
layout: default
title: How to Configure - FenixEdu™ SViz
---

<h3>How to Configure</h3>
<p style="margin-bottom: 20px">
Most visualizations receive configuration parameters. The options are documented on each visualization's page and are used as in the following example:
</p>
<table class="table table-bordered table-condensed">
  <thead>
    <th>Name</th> <th width="50%">Default Value</th> <th>Description</th>
  </thead>
  <tbody>
     <tr>
       <td>width</td> <td>the wrapping container width</td> <td>the width to be forced to the visualization</td>
     </tr>
     <tr>
       <td>radius</td> <td>50px</td> <td>the outer radius of each donut</td>
     </tr>
  </tbody>
</table>

{% highlight javascript %}
SViz.loadViz("showCourses", "data.json", "#visualization", {width="50", radius="60px"});
{% endhighlight %}

<p>
The options can be typed in any order and only those that you wish to change need to be specified.
</p>

<p>
For other or more advanced costumizations, either make a request on github if you feel this would be an improvement to everyone or fork our project and make your own changes. For the later, you may want to consult the D3 documentation.
</p>