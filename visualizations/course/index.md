---
layout: visualization
path: course
title: Course Donuts
description: This visualization provides a quick insight about all the student courses, showing him both the percentages of positive and negative grades.
call: showCourses
sample_call: SViz.showCourses("data.json", "#visualization", 500, 200);
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