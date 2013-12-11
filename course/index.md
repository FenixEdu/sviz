---
layout: default
title: Course Visualizations - FenixEdu™ SViz
---

<h4>Courses Donuts</h4>
<p class="help-block" style="margin-bottom: 20px">
This vizualization provides a quick insight about all the student courses, showing him both the percentages of positive and negative grades.
</p>
<div id="vizualization">

</div>
<script type="text/javascript">
	SViz.showCourses("/json-examples/student-courses.json", "#vizualization", 500, 200);
</script>

<h5 style="margin-top: 20px">Invocation Example</h5>
{% highlight javascript %}
SViz.showCourses("/json-examples/student-courses.json", "#vizualization", 500, 200);
{% endhighlight %}

<h5 style="margin-top: 20px">JSON Example</h5>
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