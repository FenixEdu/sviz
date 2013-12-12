(function(window) {
	// create the SViz object to export and inject it to the global environment.
	var SViz = {};
	window.SViz = SViz;

	var statisticsVisualization = function(jsonEndpoint, selector, opts) {
		d3.json(jsonEndpoint, function(data) {
		  d3.select(selector).append("h4").text("Statistic stuff");
		  d3.select(selector).append("p").text("Total Students: " + data.students.length);
		  var approvedStudents = data.students.filter(function(el, i, arr) {return (el.grade >= data.minRequiredGrade);}).length;
		  d3.select(selector).append("p").text("Approved: " + d3.round(approvedStudents*100/data.students.length) + "%  ("+approvedStudents+" students)");
		  d3.select(selector).append("p").text("Mean: " + d3.round( d3.mean(data.students, function(d) {return d.grade}), 2 ));
		  d3.select(selector).append("p").text("Min & Max: " + d3.extent(data.students, function(d) {return d.grade}));
		  d3.select(selector).append("p").text("Median: " + d3.median(data.students, function(d) {return d.grade}));
  		});
	};

	var multipleDonutsVisualization = function(jsonEndpoint, selector, width, height, opts) {
		var defaultRadius = 50;
		var defaultInnerRaidus = 40;
		var defaultNegativeGradesColor = "#F13939";
		var defaultPositiveGradesColor = "#96C472";

		var radius = opts ? opts.radius || defaultRadius : defaultRadius;
		var innerRadius = opts ? opts.innerRadius || defaultInnerRaidus : defaultInnerRaidus;
		var negativeGradesColor = opts ? opts.negativeGradesColor || defaultNegativeGradesColor : defaultNegativeGradesColor;
		var positiveGradesColor = opts ? opts.positiveGradesColor || defaultPositiveGradesColor : defaultPositiveGradesColor;

		var color = d3.scale.ordinal().range([negativeGradesColor, positiveGradesColor]);

		var arc = d3.svg.arc()
		    .outerRadius(radius)
		    .innerRadius(innerRadius);

		var pie = d3.layout.pie()
		    .sort(null)
		    .value(function(d) { return d.population; });

		d3.json(jsonEndpoint, function(data) {
		  color.domain(["negative-grades", "positive-grades"]);

		  data.forEach(function(d) {
		    d.ages = color.domain().map(function(name) {
		      var perc = d3.round((+d[name])/(+d["total"])*100,1)+"%";
		      return { name: name, population: +d[name], perc: perc, median: d["median"], stdDev: d["stdDev"] };
		    });
		  });

		  var legend = d3.select(selector).append("svg")
		      .attr("class", "legend")
		      .attr("width", radius * 2)
		      .attr("height", radius * 2)
		    .selectAll("g")
		      .data(color.domain().slice().reverse())
		    .enter().append("g")
		      .attr("transform", function(d, i) { return "translate("+(0)+"," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("width", 12)
		      .attr("height", 12)
		      .style("fill", color);

		  legend.append("text")
		      .attr("x", 16)
		      .attr("y", 6)
		      .attr("dy", ".35em")
		      .text(function(d) { return d==="positive-grades"?"Positive Grades":"Negative Grades"; });

		  var svg = d3.select(selector).selectAll(".small-pie")
		      .data(data)
		    .enter().append("svg")
		      .attr("class", "small-pie")
		      .attr("width", radius * 2)
		      .attr("height", radius * 2)
		    .append("g")
		      .attr("transform", "translate(" + radius + "," + radius + ")");

		  svg.selectAll(".arc")
		      .data(function(d) { return pie(d.ages); })
		    .enter().append("path")
		      .attr("class", "arc")
		      .attr("d", arc)
		      .attr("data-powertip", function(d) { return d.data.perc; })
		      .style("fill", function(d) { return color(d.data.name); })
		    .on('mouseover', function(e) {
		    	// TODO: SHOW SOME INFO
		    });

		  svg.append("text")
		      .attr("dy", ".35em")
		      .style("text-anchor", "middle")
		      .text(function(d) { return d.acronym; });
		
			  $(".arc").powerTip({placement: 'e' });

		});
	};


	//API EXPORTS
	SViz.showStatistics =  function(jsonEndpoint, selector, opts) {
		statisticsVisualization(jsonEndpoint, selector, opts);
	};

	SViz.showCourses =  function(jsonEndpoint, selector, width, height, opts) {
		multipleDonutsVisualization(jsonEndpoint, selector, width, height, opts);
	};

	SViz.showCourseOvertime =  function(jsonEndpoint, selector, width, height, opts) {
		multipleDonutsVisualization(jsonEndpoint, selector, width, height, opts);
	};

})(this);