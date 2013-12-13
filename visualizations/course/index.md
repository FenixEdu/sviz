---
layout: visualization
path: course
title: Course Donuts
description: This visualization provides a quick insight about all the student courses, showing him both the percentages of positive and negative grades.

call: showCourses
call_args: ""
sample_call: SViz.loadViz("showCourses", "data.json", "#visualization");
opts:
  - - width
    - the wrapping container width
    - the width to be forced to the visualization.

  - - height
    - the default aspect ratio computed with either the provided width or height
    - the height to be forced to the visualization.

  - - radius
    - 50px
    - the outer radius of each donut

  - - innerRadius
    - 40px
    - the inner radius of each donut
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
