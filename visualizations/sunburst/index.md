---
layout: visualization
path: sunburst
title: Evaluation Sunburst
description: This visualization provides a quick insight about the grades of a particular evaluation, showing a sunburst chart.
call: showEvaluationSunburst
call_args: ""
sample_call: SViz.loadViz("showEvaluationSunburst", "data.json", "#visualization");
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
	"student": { "id": "55371", "nome": "Xico Felicio" },
	"name":"Teste 1º Teste",
	"grade-scale":"TYPE20",
	"grades": [
		{ "id": "55371", "name": "Xico Felicio", "grade": "RE" },
		{ "id": "55372", "name": "Carlos Alberto", "grade": "RE" },
		{ "id": "55373", "name": "Catarina Dias", "grade": 13.3 },
		{ "id": "55374", "name": "Ricardo Feliz", "grade": "RE" },
		{ "id": "55375", "name": "Ricardo Feliz", "grade": 15.2 },
		{ "id": "55376", "name": "Ricardo Feliz", "grade": "RE" },
		{ "id": "55377", "name": "Ricardo Feliz", "grade": 10.2 },
		{ "id": "55378", "name": "Ricardo Feliz", "grade": 19.2 },
		{ "id": "55379", "name": "Ricardo Feliz", "grade": 11.2 },
		{ "id": "55380", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": "NE" },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": "RE" },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 16.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 13.2 },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": "NE" },
		{ "id": "55381", "name": "Ricardo Feliz", "grade": 12.2 },
		{ "id": "55382", "name": "Ricardo Feliz", "grade": "RE" },
		{ "id": "55383", "name": "Ricardo Feliz", "grade": "NE" },
		{ "id": "55384", "name": "Zé Carlos", "grade": 14.2 },
		{ "id": "55385", "name": "Zé Carlos", "grade": 15.2 },
		{ "id": "55386", "name": "Zé Carlos", "grade": 16 }
	]
}
{% endhighlight %}
