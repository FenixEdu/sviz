---
layout: visualization
path: boxplot
title: Evaluation Boxplot
description: This visualization provides a quick insight about the grades of a particular evaluation, showing its quartiles.
call: showEvaluationBoxPlot
call_args: ""
sample_call: SViz.loadViz("showEvaluationBoxPlot", "data.json", "#visualization");
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
	"course": "Fundamentos de Programação",
	"evaluationName": "1o Teste",
	"grades": [
		{ "name": "David Martinho", "grade": 0.2 },
		{ "name": "Carlos Alberto", "grade": 2.2 },
		{ "name": "Catarina Dias", "grade": 3.3 },
		{ "name": "Ricardo Feliz", "grade": 4.2 },
		{ "name": "Ricardo Feliz", "grade": 5.2 },
		{ "name": "Ricardo Feliz", "grade": 6.2 },
		{ "name": "Ricardo Feliz", "grade": 7.2 },
		{ "name": "Ricardo Feliz", "grade": 8.2 },
		{ "name": "Ricardo Feliz", "grade": 9.2 },
		{ "name": "Ricardo Feliz", "grade": 10.2 },
		{ "name": "Ricardo Feliz", "grade": 11.2 },
		{ "name": "Ricardo Feliz", "grade": 12.2 },
		{ "name": "Ricardo Feliz", "grade": 13.2 },
		{ "name": "Zé Carlos", "grade": 14.2 },
		{ "name": "Zé Carlos", "grade": 15.2 },
		{ "name": "Zé Carlos", "grade": 16 }
	]
}
{% endhighlight %}
