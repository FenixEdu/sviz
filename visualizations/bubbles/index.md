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
	            //[year, approved, flunked, not-evaluated]
	            [2004, 43, 6, 8],
	            [2005, 25, 6, 8],
	            [2006, 56, 6, 8],
	            [2007, 30, 21, 3],
	            [2008, 10, 53, 1]
	        ]
	    },
	    {
	        "name": "Introduction to Programming",
	        "years": [
 	            [2004, 14, 46, 54],
	            [2005, 72, 53, 21],
	            [2006, 52, 12, 11],
	            [2007, 30, 75, 12],
	            [2008, 54, 43, 53]
	        ]
	    },
	    ...
	]
}
{% endhighlight %}
