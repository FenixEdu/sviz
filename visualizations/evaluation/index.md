---
layout: visualization
path: evaluation
title: Evaluation
description: A histogram of marks obtained in an evaluation with optional detailed side and table views.
call: showHistogram
call_args: ""
sample_call: SViz.showHistogram("data.json", "#visualization", 1000, 350);
---

The student 'ID' must be unique and is not limited to numbers. 'selfID' is the ID of the students who is logged in and viewing the chart.
{% highlight json %}
{ "minGrade": 0,
  "maxGrade": 20,
  "minRequiredGrade": 9,
  "selfID": "3",
  "students": [
	{ "ID": "1", "name": "Harry Wallington", "photo": "imgs/avatar_male.png", "grade": 9.50  },
	{ "ID": "2", "name": "Andrea Bleckley", "photo": "imgs/avatar_female.png", "grade": 7.55  },
	{ "ID": "3", "name": "John Hobbes", "photo": "imgs/avatar_male.png", "grade": 6.78  },
	{ "ID": "4", "name": "Edwin Cranford", "photo": "imgs/avatar_male.png", "grade": 2.30  },
	{ "ID": "5", "name": "Joseph Dickens", "photo": "imgs/avatar_male.png", "grade": 4.58  },
	{ "ID": "6", "name": "Brooke Wayment", "photo": "imgs/avatar_female.png", "grade": 4.93  },
 ...
]}
{% endhighlight %}
<p class="pull-right" style="font-size: 10px;">* All data was randomly generated.</p>