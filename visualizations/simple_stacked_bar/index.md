---
layout: visualization
path: simple_stacked_bar
title: Simple Stacked Bar
description: This visualization provides a simple, all purpose, staked bar.
call: showStackedBar
call_args: ""
sample_call: SViz.loadViz("showStackedBar", "data.json", "#visualization");
opts:
  - - width
    - the wrapping container width
    - the width to be forced to the visualization.

  - - height
    - the default aspect ratio computed with either the provided width or height
    - the height to be forced to the visualization.

  - - showLegend
    - true
    - displays legend

  - - legendSelector
    - the original selector
    - the selector where the legend should be displayed
---

{% highlight json %}
{ "minGrade": 0,
  "maxGrade": 20,
  "minRequiredGrade": 9,
  "notAttended": "NA",
  "students": [
  { "grade": 9.50  },
  { "grade": 7.55  },
  { "grade": 6.78  },
  { "grade": "NA"  },
  { "grade": 4.58  },
  { "grade": 4.93  },
 ...
 ]}
{% endhighlight %}
