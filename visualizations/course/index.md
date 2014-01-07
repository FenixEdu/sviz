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

  - - showLegend
    - true
    - displays legend

  - - legendSelector
    - the original selector
    - the selector where the legend should be displayed
---

{% highlight json %}
{% include donuts/example.json %}
{% endhighlight %}
