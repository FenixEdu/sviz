---
layout: visualization
path: simple_donut
title: Simple Donut
description: This visualization provides a simple, all purpose, single donut.
call: showDonut
call_args: ", {title:false}"
sample_call: SViz.loadViz("showDonut", "data.json", "#visualization", {title:false});
opts:
  - - width
    - 150
    - total width, including margins

  - - height
    - 150
    - total height, including margins

  - - radius
    - square fit of the container
    - the radius of the donut

  - - innerRadius
    - less 20 than the radius
    - radius of the donut's hole. Set to 0 to make a pie

  - - title
    - true
    - show title

  - - titleclass
    - h4
    - css class for the title

  - - legend
    - true
    - show legend

  - - legendSelector
    - the original selector
    - the selector where the legend should be displayed
---

{% highlight json %}
{ "calculated": {
    "cat1": 74,
    "cat2": 34,
    "cat3": 21
    ...
  }
}
{% endhighlight %}
