(function(window, $, i18n) {

	// create the SViz object to export and inject it to the global environment.
	var SViz = {};
	window.SViz = SViz;

	var lang = 'en';
	i18n.init({ fallbackLng: lang , lng: lang, resGetPath: '/js/locales/__lng__/__ns__.json' , getAsync: false, debug: true });

	var error = function(msg) {
		console.log(msg);
	}

	var valuesInsideDomainOnly = function(data) {
		return function(d) {
			if(d.grade>=data.minGrade && d.grade<=data.maxGrade) {
				return d.grade;
			}
		};
	};

	var statisticsVisualization = function(data, selector, opts) {
		if(!opts) var opts={};
		//if opts.help
		var lng = i18n.t("statistics", { returnObjectTrees: true });
	 	d3.select(selector).append("h4").text(lng["title"]);
	 	var totalStudents = data.students.length;
	 	var approvedStudents = d3.sum(data.students, function(el) {return (el.grade >= data.minRequiredGrade);});
	 	var noAttendStudents = d3.sum(data.students, function(el) {return (el.grade === data.notAttended);});
	  	if(opts.total!=false) {d3.select(selector).append("p").text( lng["total-students"] + totalStudents);}
	  	if(opts.approved!=false) {d3.select(selector).append("p").text( lng["approved"]	+ d3.round(approvedStudents*100/totalStudents, 1) + "%  ("+approvedStudents+" "+i18n.t("students")+")");}
	  	if(data.notAttended && opts.noattend!=false) {
	  		d3.select(selector).append("p")
	  			.text( lng["no-attends"] + d3.round(noAttendStudents*100/totalStudents, 1) + "%  ("+noAttendStudents+" "+i18n.t("students")+")");
	  	}
	  	if(opts.mean!=false) {d3.select(selector).append("p").text( lng["mean"] + d3.round(d3.mean(data.students, valuesInsideDomainOnly(data)), 2));}
	  	if(opts.extent!=false) {d3.select(selector).append("p").text( lng["extent"] + d3.extent(data.students, valuesInsideDomainOnly(data)));}
	  	if(opts.median!=false) {d3.select(selector).append("p").text( lng["median"] + d3.round(d3.median(data.students, valuesInsideDomainOnly(data)), 2));}
	};

	var multipleDonutsVisualization = function(data, selector, opts) {
		var lng = i18n.t("donuts", { returnObjectTrees: true });

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
		      .text( function(d) { return lng[d]; });

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
	};


	//VISUALIZATIONS TO EXPORT
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
		debugger;
		if(params && params.lang) {
			i18n.setLng(lang, function(t) { /* loading done */ });
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
