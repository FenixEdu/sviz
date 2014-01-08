---
layout: visualization
path: bubbles
title: Bubbles Overtime
description: This visualization provides a quick insight about the grades of several curricular courses over the years.
call: showCurricularCoursesOvertime
call_args: ""
sample_call: SViz.loadViz("showCurricularCoursesOvertime", "data.json", "#visualization");
opts:
  - - width
    - the wrapping container width
    - the width to be forced to the visualization.

  - - height
    - the default aspect ratio computed with either the provided width or height
    - the height to be forced to the visualization.


---

{% highlight json %}
{
	"start-year": 2004,
	"end-year": 2008,
	"entries": [
	    {
	        "name": "Software Engineering",
	        "years": [
	            [2004, 4],
	            [2005, 2],
	            [2006, 5],
	            [2007, 30],
	            [2008, 10]
	        ]
	    },
	    {
	        "name": "Introduction to Programming",
	        "years": [
 	            [2004, 4],
	            [2005, 2],
	            [2006, 52],
	            [2007, 30],
	            [2008, 54]
	        ]
	    },
	    ...
	]
}
{% endhighlight %}
