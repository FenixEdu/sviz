---
layout: default
title: How to Use - FenixEdu™ SViz
---

<h3>How to Use</h3>
<p class="help-block" style="margin-bottom: 20px">
Download or include directly:
</p>

{% highlight html %}
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
{% endhighlight %}


Call visualizations to be inserted in containers:
{% highlight html %}
<div id="visualization"></div>
<script> 
  SViz.loadViz("showCourses", "example.json", "#visualization");
</script>
{% endhighlight %}
