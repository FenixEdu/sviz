---
layout: default
title: How to Use - FenixEdu™ SViz
---

<h3>How to Use</h3>
<p style="margin-bottom: 20px">
Download or include directly:
</p>

{% highlight html %}
<script type="text/javascript" src="../javaScript/sviz/sviz.min.js"></script>
{% endhighlight %}

Include Dependencies and css:
{% highlight html %}
<link href="../javaScript/sviz/sviz.css" rel="stylesheet" media="screen" type="text/css" />
<script type="text/javascript" src="../javaScript/jquery/jquery-1.8.0.min.js"></script>
<script type="text/javascript" src="../javaScript/sviz/d3.min.js"></script>
<script type="text/javascript" src="../javaScript/sviz/qtip.min.js"></script>
<script type="text/javascript" src="../javaScript/sviz/i18next.min.js"></script>
{% endhighlight %}


Call visualizations to be inserted in containers:
{% highlight html %}
<div id="visualization"></div>
<script>
  SViz.init({ lang: "en", localesBasePath: "../javaScript/sviz" });
  SViz.loadViz("showCourses", "data.json", "#visualization");
</script>
{% endhighlight %}
