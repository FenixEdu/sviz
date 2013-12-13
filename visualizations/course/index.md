---
layout: visualization
path: course
title: Course Donuts
description: This visualization provides a quick insight about all the student courses, showing him both the percentages of positive and negative grades.
call: showCourses
call_args: ""
sample_call: SViz.loadViz("showCourses", "data.json", "#visualization");
---

{% highlight json %}
[{ 
	"acronym": "IP",
	"name": "Introduction to Programming",
	"positive-grades": 74,
	"negative-grades": 34,
	"total": 108,
	"median": 12.4,
	"stdDev": 2.45
 },
 ...
]
{% endhighlight %}

<h5 style="margin-top: 20px">Optional Parameters</h5>
<table class="table table-bordered table-condensed">
	<thead>
		<th>Name</th>
		<th width="50%">Default Value</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>width</td>
			<td>the wrapping container width</td>
			<td>the width to be forced to the visualization.</td>
		</tr>
		<tr>
			<td>height</td>
			<td>the default aspect ratio computed with either the provided width or height</td>
			<td>the height to be forced to the visualization.</td>
		</tr>
		<tr>
			<td>radius</td>
			<td>50px</td>
			<td>the outer radius of each donut</td>
		</tr>
		<tr>
			<td>innerRadius</td>
			<td>40px</td>
			<td>the inner radius of each donut</td>
		</tr>
	</tbody>
</table>