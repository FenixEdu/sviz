---
layout: visualization
path: histogram
title: Histogram
description: An histogram of the marks obtained in an evaluation. This visualization has optional detailed side and table views when hovering the main chart.
call: showHistogram
call_args: ", {details: true}"
sample_call: 'SViz.showHistogram("data.json", "#visualization", {width: 1000});'
opts:
  - - details
    - true
    - show a detailed side chart
  - - table
    - true
    - show a detailed table
  - - tableColumns
    - "['ID', 'photo', 'name', 'grade']"
    - ordered visibility of the table's columns
  - - legend
    - true
    - show legend
  - - highlightStudent
    - true
    - hilight the student's mark
  - - showMinGrade
    - true
    - show minimum grade
  - - tooltip
    - true
    - show tooltip
  - - barNumbers
    - count
    - "'none', 'count' or 'percent'"
  - - tipNumbers
    - percent
    - "'none', 'count' or 'percent'"
  - - detailsBarWidth
    - half of the space for each bar
    - sets the bar width of the details side chart
---


The student 'ID' must be unique and is not limited to numbers. 'selfID' is the ID of the student who is logged in and viewing the chart.
{% highlight json %}
{ "minGrade": 0,
  "maxGrade": 20,
  "minRequiredGrade": 9,
  "selfID": "3",
  "students": [
	{ "ID": "1", "name": "Harry Wallington", "photo": "imgs/avatar_male.png", "grade": 3.8  },
	{ "ID": "2", "name": "Andrea Bleckley", "photo": "imgs/avatar_female.png", "grade": 9.5  },
	{ "ID": "3", "name": "John Hobbes", "photo": "imgs/avatar_male.png", "grade": 9.6  },
	{ "ID": "4", "name": "Edwin Cranford", "photo": "imgs/avatar_male.png", "grade": 12.3  },
	{ "ID": "5", "name": "Joseph Dickens", "photo": "imgs/avatar_male.png", "grade": 14.8  },
	{ "ID": "6", "name": "Brooke Wayment", "photo": "imgs/avatar_female.png", "grade": 14.9  },
 ...
]}
{% endhighlight %}
<p class="pull-right" style="font-size: 10px;">* All data was randomly generated.</p>