---
layout: visualization
path: statistics
title: Statistics
description: A text-based presentation of useful statistical values.
call: showStatistics
call_args: ""
sample_call: SViz.showStatistics("data.json", "#visualization");
---

These are the required fields for this visualization to work. More fields can be added (for joint use with other visualizations), as long as this structure remains unchanged.
{% highlight json %}
{ "minRequiredGrade": 9,
  "students": [
	{ "grade": 9.50  },
	{ "grade": 7.55  },
	{ "grade": 6.78  },
	{ "grade": 2.30  },
	{ "grade": 4.58  },
	{ "grade": 4.93  },
 ...
]}
{% endhighlight %}