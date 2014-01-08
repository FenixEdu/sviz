---
layout: visualization
path: progress
title: Student Progress
description: The progress bars of a particular student.
call: showStudentProgress
call_args: ""
sample_call: SViz.loadViz("showStudentProgress", "data.json", "#visualization");
opts:
  - - "[measure]"
    - "true for all measures [total, approved, noattend, extent, mean, median]"
    - true of false to display (or not) each measure
  - - help
    - true
    - displays an help tooltip explaining each measure
---

These are the required fields for this visualization to work. More fields can be added (for joint use with other visualizations), as long as this structure remains unchanged. If "notAttended" is not included, the number of not evaluated students will not be displayed.
{% highlight json %}
[{
  "degree": "LEIC-A 2003",
  "required-credits": 145,
  "credits": 148,
  "status": "concluded"
}, {
  "degree": "MEIC-A 2007",
  "required-credits": 112,
  "credits": 133,
  "status": "concluded"
}, {
  "degree": "DEIC-A 2010",
  "required-credits": 145,
  "credits": 33,
  "status": "active"
}]
{% endhighlight %}