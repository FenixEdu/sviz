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

	var histogramVisualization = function(data, selector, opts) {

		if(!opts) var opts={};

		var lng = i18n.t("histogram", { returnObjectTrees: true });

		var margin = {top: 10, right: 20, bottom: 20, left: 30}, xgap = 50,
    			width1 = 560 - margin.left - xgap/2,
    			width2 = 250 - xgap/2 - margin.right,
    			height = 260 - margin.top - margin.bottom;

		/* First set of Axes */
		var x = d3.scale.linear();

		var xAxis = d3.svg.axis()
    			.scale(x)
			.ticks(20)
    			.orient("bottom");

		var y = d3.scale.linear()
    			.rangeRound([height, 0]);

		var yAxis = d3.svg.axis()
    			.scale(y)
    			.orient("left");

		/* Second set of Axes */
		var x2 = d3.scale.linear();

		var xAxis2 = d3.svg.axis()
    			.scale(x2)
    			.ticks(10)
    			.orient("bottom");

		/* Tip */
		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
		    var str = "";
		    for(var i in d) {
		      if(!(i in {'x':1, 'dx':1, 'y':1}))
		        str += "<div><img src='"+d[i].photo+"' width='18' height='18' style='vertical-align:middle;/><span style='vertical-align:middle;'> "+d[i].name+" - "+d[i].grade+"</span></div><br/>";
		    }
		    return "<span style='color:red'>" + str + "</span>";
		  })

    		function comparator(a, b) {
			if (a.grade > b.grade) return 1;
		    	if (a.grade < b.grade) return -1;
		    	// equal grades, solve by ID
	 		if (a.ID > b.ID) return 1;
    			if (a.ID < b.ID) return -1;
    			return 0;
		}

		function sortBinElements(element, index, array) {
  			element.sort(comparator);
		}

		var frame = d3.select(selector).append("svg")
    			.attr("width", width1 + width2 + xgap + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom);
		var svg = frame.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		svg.call(tip);

		  /* Setting up scales and bins */
		  x.domain([data.minGrade-0.5, data.maxGrade+0.5])
		   .rangeRound([0,width1]);

		  var barWidth = x(1)-x(0);

		  var values = d3.layout.histogram()
		      .range([data.minGrade-0.5, data.maxGrade+0.5])
		      .bins(data.maxGrade+1)
		      .value(function(d) { return d.grade; })
		      (data.students);
		  values.forEach(sortBinElements);

		  y.domain([0, d3.max(values, function(d) { return d.y; })])

		  /* min Grade Rectangle */
		  svg.append("g")
		     .attr("render-order", -1) //isto nao funciona
		     .append("rect")
		        .attr("class", "minRect")
		        .attr("x", 0)
		        .attr("width", x(data.minRequiredGrade))
		        .attr("height", height);

		 /* bars */
		  var bar = svg.selectAll(".bar")
		      .data(values)
		    .enter().append("g")
		      .attr("class", function(d) {
		        for(var i in d) {
		          if(!(i in {'x':1, 'dx':1, 'y':1}))
		            if(d[i].ID == data.selfID){
		              return "bar you";
		            }
		        }
		        return "bar";})
		      .attr("transform", function(d) { return "translate(" + x(d.x+0.5) + "," + y(d.y) + ")"; })
		      .on('mouseover', function (d) {
		        tip.show(d);
		        x2.domain([d.x, d.x+1]);
		        sideChart.select(".x.axis").call(xAxis2);
		        updateSideChart(sideValues.range([d.x, d.x+1])(d));
		      })
		      .on('mouseout', tip.hide);

		  bar.append("rect")
		      .attr("x", 1- barWidth/2)
		      .attr("width", barWidth -2)
		      .attr("height", function(d) { return height - y(d.y); });

		  /* number with count inside bars */
		  bar.append("text")
		      .attr("dy", ".75em")
		      .attr("y", 6)
		      .attr("x", 0)
		      .attr("text-anchor", "middle")
		      .text(function(d) { if(d.y!=0) {return d.y;} });

		  /* sticks inside bars */
		  var gradesHash = d3.nest()
		    .key(function(d) { return d3.round(d.grade,1); })
		    .entries(data.students);

		  var stick = svg.selectAll(".stick")
		      .data(gradesHash)
		    .enter().append("g")
		      .attr("class", "stick")
		      .attr("transform", function(d) { return "translate(" + x(d.key) + ", 0)"; });

		  stick.append("line")
		        .attr("x1", 0)
		        .attr("x2", 0)
		        .attr("y1", height)
		        .attr("y2", function(d) { return y(d.values.length); });

		  /* min Grade */
		  svg.append("g")
		      .attr("class", "line")
		      .attr("transform", function(d) { return "translate(" + x(data.minRequiredGrade) + ", 0)"; })
		      .append("line")
		        .attr("x1", 0)
		        .attr("x2", 0)
		        .attr("y1", 0)
		        .attr("y2", height);

		  /* x Axis */
		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("x", width1)
		      .attr("y", 30)
		      .style("text-anchor", "end")
		      .text("Grade");

		  /* y Axis */
		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Frequency");

		  /* Legend */
		  var legend = svg.append("g")
		      .attr("class", "legend")
		      .attr("transform", "translate(0,0)");

		  var l1 = legend.append("g")
		      .attr("transform", "translate("+(width1-18)+",0)");
		  l1.append("rect")
		        .attr("width", 18)
		        .attr("height", 18)
		        .style("fill", "purple")
		  l1.append("text")
		        .attr("x", -6)
		        .attr("y", 9)
		        .attr("dy", ".35em")
		        .style("text-anchor", "end")
		        .text("Você está aqui");

		  var l2 = legend.append("g")
		      .attr("transform", "translate("+(width1-18)+",20)");
		  l2.append("line")
		      .attr("x2", 18)
		      .attr("y1", 9)
		      .attr("y2", 9)
		      .attr("class", "line");
		  l2.append("text")
		      .attr("x", -6)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text("Nota mínima");


		  /** Side Chart **/
		  var sideChart = frame.append("g").attr("transform", "translate("+(margin.left+width1+xgap)+","+margin.top+")");

		  /* Setting up scales */
		  x2.domain([data.minGrade-0.5, data.maxGrade+0.5])
		   .rangeRound([0,width2]);
		  var barWidth2 = x2(1)-x2(0);

		  /* x Axis */
		  sideChart.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis2)

		  /* bars */
		  function updateSideChart(sideValues) {

		    // DATA JOIN - Join new data with old elements, if any.
		    var sbar = sideChart.selectAll(".bar")
		        .data(sideValues);

		    // UPDATE - Update old elements as needed.

		    // ENTER - Create new elements as needed.
		    sbar.enter().append("g")
		      .attr("class", function(d) {
		        for(var i in d) {
		          if(!(i in {'x':1, 'dx':1, 'y':1}))
		            if(d[i].ID == data.selfID){
		              return "bar you";
		            }
		        }
		        return "bar";})
		      .attr("transform", function(d) { return "translate(" + x2(d.x+0.5) + ",0)"; })

		    sbar.append("rect")
		      .attr("x", 1- barWidth2/2)
		      .attr("width", barWidth2 -2);

		    // ENTER + UPDATE
		    sbar.attr("class", function(d) {
		        for(var i in d) {
		          if(!(i in {'x':1, 'dx':1, 'y':1}))
		            if(d[i].ID == data.selfID){
		              return "bar you";
		            }
		        }
		        return "bar";})
		    sbar.select("rect")
		      .attr("y", function(d) { return y(d.y); })
		      .attr("height", function(d) { return height - y(d.y); });

		    // EXIT - Remove old elements as needed.
		    sbar.exit().remove();
		  }

		  var sideValues = d3.layout.histogram()
		      .range([data.minGrade-0.5, data.maxGrade+0.5])
		      .bins(11)
		      .value(function(d) { return d.grade; });

		  updateSideChart(sideValues(data.students));

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
		showHistogram: function(data, selector, opts) {
			histogramVisualization(data, selector, opts);
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
