---
layout: visualization
path: statistics2
title: Overall Statistics
description: A text-based presentation of useful statistical values and achievements in the student's progress.
call: showOverallStatistics
call_args: ""
sample_call: SViz.loadViz("showOverallStatistics", "data.json", "#visualization");
opts:
  - - "[measure]"
    - "true for all measures [mean, extent, approved, flunked, noattend]"
    - true of false to display (or not) each measure
  - - help
    - true
    - displays an help tooltip explaining each measure
---

These are the required fields for this visualization to work.
{% highlight json %}
{ "mean": 14.31,
  "minGrade": 11,
  "maxGrade": 17,
  "approved": 10,
  "flunked": 9,
  "notAttended": 6
}
{% endhighlight %}