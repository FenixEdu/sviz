---
layout: visualization
path: simple_stacked_bar
title: Simple Stacked Bar
description: This visualization provides a simple, all purpose, staked bar.
call: showStackedBar
call_args: ", {title:false, barHeight:30}"
sample_call: SViz.loadViz("showStackedBar", "data.json", "#visualization", {title:false});
opts:
  - - width
    - 150
    - total width, including margins

  - - height
    - 150
    - total height, including margins

  - - barHeight
    - 30
    - bar height

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
