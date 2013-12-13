(function(window, $, i18n) {
	// create the SViz object to export and inject it to the global environment.
	var SViz = {};
	window.SViz = SViz;
	var lang = "en";

	var statisticsVisualization = function(data, selector, opts) {
	  d3.select(selector).append("h4").text("Statistic stuff");
	  d3.select(selector).append("p").text("Total Students: " + data.students.length);
	  var approvedStudents = data.students.filter(function(el, i, arr) {return (el.grade >= data.minRequiredGrade);}).length;
	  d3.select(selector).append("p").text("Approved: " + d3.round(approvedStudents*100/data.students.length) + "%  ("+approvedStudents+" students)");
	  d3.select(selector).append("p").text("Mean: " + d3.round( d3.mean(data.students, function(d) {return d.grade}), 2 ));
	  d3.select(selector).append("p").text("Min & Max: " + d3.extent(data.students, function(d) {return d.grade}));
	  d3.select(selector).append("p").text("Median: " + d3.median(data.students, function(d) {return d.grade}));
	};

	var error = function(msg) {
		console.log(msg);
	}

	var multipleDonutsVisualization = function(data, selector, opts) {
		var ratio = 3/4;
		var defaultRadius = 50;
		var defaultInnerRaidus = 30;
		var defaultNegativeGradesColor = "#F13939";
		var defaultPositiveGradesColor = "#96C472";

		var radius = opts ? opts.radius || defaultRadius : defaultRadius;
		var innerRadius = opts ? opts.innerRadius || defaultInnerRaidus : defaultInnerRaidus;
		var negativeGradesColor = opts ? opts.negativeGradesColor || defaultNegativeGradesColor : defaultNegativeGradesColor;
		var positiveGradesColor = opts ? opts.positiveGradesColor || defaultPositiveGradesColor : defaultPositiveGradesColor;

		var width = opts ? opts.width || $(selector).width() :  $(selector).width();
		var height = opts ? opts.height || (width*ratio) :  (width*ratio);

		var color = d3.scale.ordinal().range([negativeGradesColor, positiveGradesColor]);

		var arc = d3.svg.arc()
		    .outerRadius(radius)
		    .innerRadius(innerRadius);

		var pie = d3.layout.pie()
		    .sort(null)
		    .value(function(d) { return d.population; });

		  color.domain(["negative-grades", "positive-grades"]);

		  data.forEach(function(d) {
		    d.ages = color.domain().map(function(name) {
		      var perc = d3.round((+d[name])/(+d["total"])*100,1)+"%";
		      return { name: name, population: +d[name], perc: perc, median: d["median"], stdDev: d["stdDev"] };
		    });
		  });

		  var legend = d3.select(selector).append("svg")
		      .attr("class", "legend-text")
		      .attr("width", 150)
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
		      .attr("data-i18n", function(d) { return d; });

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
		      .attr("title", function(d) { return d.data.perc; })
		      .attr("class", "arc tip")
		      .attr("d", arc)
		      .style("fill", function(d) { return color(d.data.name); });

		  svg.append("text")
        	  .attr("dy", ".35em")
        	  .attr("class", "donut-center-text")
        	  .style("text-anchor", "middle")
        	  .text(function(d) { return d.acronym; });

   		  $(".tip").qtip({
			style: "qtip-tipsy",
			position: {
            	target: 'mouse',
            	adjust: { x: 10, y: 10 }
         	}
       	  });

		  visualizationCompleted();
	};

	//Triggers I18N translations
	var triggerI18N = function() {
		i18n.setLng(lang, function() {
			i18n.init(function(t) {
			  $("[data-i18n]").i18n();
			});
		});
	};
	
	var visualizationCompleted = function() {
		triggerI18N();
	}

	//VIZUALIZATIONS TO EXPORT
	var visualizations = {
		showStatistics : function(data, selector, opts) {
			statisticsVisualization(data, selector, opts);
		},
		showCourses : function(data, selector, opts) {		
			multipleDonutsVisualization(data, selector, opts);
		},
		showCourseOvertime : function(data, selector, opts) {
			multipleDonutsVisualization(data, selector, opts);
		}
	};

	SViz.init = function(params) {
		if(params && params.lang) {
			lang = params.lang;
			triggerI18N();
		}
	};

	SViz.loadViz = function(vizName, data, selector, opts) {
		if (visualizations[vizName] !== "undefined") {
			if(typeof data === "object") {
				visualizations[vizName](data, selector, opts);
			} else {
				d3.json(data, function(data) {
					visualizations[vizName](data, selector, opts);
				});
			}
		} else {
			error("Visualization named '"+vizName+"' not found.");
		}
	};

})(this, jQuery, i18n);
