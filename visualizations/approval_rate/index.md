---
layout: visualization
path: approval_rate
title: Approval Rate
description: Rate of approved subjects by period (semester), comparing to enrolled subjects.
call: showApprovalRate
call_args: ", {classic:false, width:700, margin:{left:0}}"
sample_call: SViz.loadViz("showApprovalRate", "data.json", "#visualization");
opts:
  - - width
    - 600
    - total width, including margins
  - - blockWidth
    - 50
    - size for each block, including padding and 2 bars. In pixels.
  - - blockPadding
    - 10
    - padding bellow and above the 2 bars. In pixels.
  - - barWidth
    - 0.9
    - bar width in percent
---

These are the required fields for this visualization to work. More fields can be added (for joint use with other visualizations), as long as this structure remains unchanged. If "notAttended" is not included, the number of not evaluated students will not be displayed.
{% highlight json %}
{"periods": [
["2010/2011 - 2º sem",3, 3],
["2011/2012 - 1º sem",3, 3],
["2011/2012 - 2º sem",3, 3],
["2012/2013 - 1º sem",2, 2],
["2012/2013 - 2º sem",1, 0]
]}
{% endhighlight %}