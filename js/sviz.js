(function(window, $, d3, i18n) {

	// create the SViz object to export and inject it to the global environment.
	var SViz = {};
	window.SViz = SViz;

	var svizIsNotInitialized = true;

	var DEBUG_MODE = true;

	var i18nOpts = {
		fallbackLng: 'en',
		lng: 'en',
		localesRelPath: '/locales/__lng__/__ns__.json',
		localesBasePath: '/js',
		getAsync: false,
		debug: true
	};

	var log = {
		debug : function(msg, obj) {
			if(DEBUG_MODE) {
				console.log("[SViz Debug] - " + msg);
				console.log(obj);
			}
		},
		error : function(msg, obj) {
			console.log("[SViz Error] - " + msg);
			console.log(obj);
		}
	};

	var util = {
		valuesInsideDomainOnly : function(data) {
			return function(d) {
				if(d.grade>=data.minGrade && d.grade<=data.maxGrade) {
					return d.grade;
				}
			};
		},
		computeMinMaxAndQuartiles : function(data, key) {
			var values = [];
			data.forEach(function(datum) {
				var value = datum[key];
				values.push(value);
			});
			var sortedValues = values.sort(d3.ascending);
			var min = d3.round(d3.quantile(sortedValues, 0), 2);
			var q1 = d3.round(d3.quantile(sortedValues, 0.25), 2);
			var q2 = d3.round(d3.quantile(sortedValues, 0.5), 2);
			var q3 = d3.round(d3.quantile(sortedValues, 0.75), 2);
			var max = d3.round(d3.quantile(sortedValues, 1), 2);
			var result = { min: min, q1: q1, q2: q2, q3: q3, max: max, median: q2 };
			log.debug("Computed Quantiles", result);
			return result;
		}
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
	  	if(opts.mean!=false) {d3.select(selector).append("p").text( lng["mean"] + d3.round(d3.mean(data.students, util.valuesInsideDomainOnly(data)), 2));}
	  	if(opts.extent!=false) {d3.select(selector).append("p").text( lng["extent"] + d3.extent(data.students, util.valuesInsideDomainOnly(data)));}
	  	if(opts.median!=false) {d3.select(selector).append("p").text( lng["median"] + d3.round(d3.median(data.students, util.valuesInsideDomainOnly(data)), 2));}
	};

	var histogramVisualization = function(data, selector, opts) {

		if(!opts) var opts={};

		var lng = i18n.t("histogram", { returnObjectTrees: true });

		var margin = {top: 10, right: 20, bottom: 20, left: 30}, xgap = 50,
    			width1 = 560 - margin.left - xgap/2,
    			width2 = 250 - xgap/2 - margin.right,
    			height = 260 - margin.top - margin.bottom;

		/* Axes */
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
		if(data.minRequiredGrade && opts.showMinGrade!=false) {
		  svg.append("g")
		     .append("rect")
		        .attr("class", "minRect")
		        .attr("x", 0)
		        .attr("width", x(data.minRequiredGrade))
		        .attr("height", height);
		}

		/* bars */
		var hilightStudent = function(data) {
			return function(d) {
				if(data.selfID && opts.hilightStudent!=false) {
				        for(var i in d) {
				          if(!(i in {'x':1, 'dx':1, 'y':1}))
				            if(d[i].ID == data.selfID){
				              return "tip bar you";
				            }
				        }
				}
			        return "tip bar";
			}
		}

		  var bar = svg.selectAll(".bar")
		      .data(values)
		    .enter().append("g")
		      .attr("title",function(d){
		        var str = "";
		        for(var i in d) {
		          if(!(i in {'x':1, 'dx':1, 'y':1}))
		            str += "<div><img src='"+d[i].photo+"' width='18' height='18' style='vertical-align:middle;/><span style='vertical-align:middle;'> "+d[i].name+" - "+d[i].grade+"</span></div><br/>";
		        }
		        return "<span style='color:red'>" + str + "</span>"; })
		      .attr("class",hilightStudent(data))
		      .attr("transform", function(d) { return "translate(" + x(d.x+0.5) + "," + y(d.y) + ")"; })
		      .on('mouseover', function (d) {
		        if(opts.details!=false) {
			  x2.domain([d.x, d.x+1]);
			  sideChart.select(".x.axis").call(xAxis2);
			  updateSideChart(sideValues.range([d.x, d.x+1])(d));
			  updateTable(d);
			}
		      });

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

		/* min Grade Line */
		if(data.minRequiredGrade && opts.showMinGrade!=false) {
		  svg.append("g")
		      .attr("class", "line")
		      .attr("transform", function(d) { return "translate(" + x(data.minRequiredGrade) + ", 0)"; })
		      .append("line")
		        .attr("x1", 0)
		        .attr("x2", 0)
		        .attr("y1", 0)
		        .attr("y2", height);
		}

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
		    .text(lng['y-label']);

		/* Legend */
		if(opts.legend!=false) {
			var legend = svg.append("g")
			      .attr("class", "legend")
			      .attr("transform", "translate(0,0)");

			var dy=0;
			if(data.selfID && opts.hilightStudent!=false) {
				var l = legend.append("g").attr("transform", "translate("+(width1-18)+","+dy+")");
				l.append("rect")
				        .attr("width", 18)
				        .attr("height", 18)
				        .style("fill", "purple")
				l.append("text")
				        .attr("x", -6)
				        .attr("y", 9)
				        .attr("dy", ".35em")
				        .style("text-anchor", "end")
				        .text(lng['self-id']);
				dy+=20;
			}
			if(data.minRequiredGrade && opts.showMinGrade!=false) {
				var l = legend.append("g").attr("transform", "translate("+(width1-18)+","+dy+")");
				l.append("line")
				      .attr("x2", 18)
				      .attr("y1", 9)
				      .attr("y2", 9)
				      .attr("class", "line");
				l.append("text")
				      .attr("x", -6)
				      .attr("y", 9)
				      .attr("dy", ".35em")
				      .style("text-anchor", "end")
				      .text(lng['min-grade']);
			}
		}

		/* Tooltip */
		//corner: { target: 'topMiddle', tooltip: 'bottomMiddle' }
		$(".tip").qtip({style: "qtip-tipsy",
				position: { target: 'mouse', adjust: { x: 10, y: 10 } }});

		/** Side Chart **/
		if(opts.details!=false) {
		  var sideChart = frame.append("g").attr("transform", "translate("+(margin.left+width1+xgap)+","+margin.top+")");

		  /* Setting up scales */
		  var x2 = d3.scale.linear()
			.domain([data.minGrade-0.5, data.maxGrade+0.5])
			.rangeRound([0,width2]);

		  var barWidth2 = x2(1)-x2(0);

		  /* x Axis */
		  var xAxis2 = d3.svg.axis()
			.scale(x2)
			.ticks(10)
			.orient("bottom");

		  sideChart.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis2)

		  /* bars */
		  function updateSideChart(sideValues) {

		    // DATA JOIN - Join new data with old elements, if any.
		    var sbar = sideChart.selectAll(".bar")
		        .data(sideValues);

		    // ENTER - Create new elements as needed.
		    sbar.enter().append("g")
		      .attr("transform", function(d) { return "translate(" + x2(d.x+0.5) + ",0)"; })
		      .append("rect")
		        .attr("x", 1- barWidth2/2)
		        .attr("width", barWidth2 -2);

		    // UPDATE - Update new and old elements
		    sbar.attr("class", hilightStudent(data));
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
		}

		/** Details Table **/
		if(opts.table!=false) {
		  var table = d3.select(selector).append("table").attr("class", "table table-hover table-bordered table-condensed");

		  var columns = opts.tableColumns || ["ID", "photo", "name", "grade"];

		  var theader = table.append("thead");
		  theader.append("tr").selectAll("th")
		      .data(function() { return columns.map(function(column) {return {column: column, value: lng["table-columns"][column]};}); })
		    .enter().append("th")
		      .text(function(d) { return d.value; });

		  var tbody = table.append("tbody");

		  function updateTable(values) {
		    // DATA JOIN - Join new data with old elements, if any.
		    var tr = tbody.selectAll("tr")
		        .data(values);

		    // ENTER - Create new elements as needed.
		    tr.enter().append("tr");

		    // UPDATE - Update new and old elements
		    tr.selectAll("td")
		      .data( function(row) { return columns.map(function(column) {return {column: column, value: row[column]};}); })
		    .enter().append("td");
		    tr.selectAll("td")
		      .html(function(d) { return d.column=="photo"? "<img src='"+d.value+"' width='25px' alt='photo'/>" : d.value; });

		    // EXIT - Remove old elements as needed.
		    tr.exit().remove();
		  }

		  updateTable(data.students);
		}
	};


	var multipleDonutsVisualization = function(data, selector, opts) {
		var lng = i18n.t("donuts", { returnObjectTrees: true });

		var ratio = 3/4;
		var defaultRadius = 50;
		var defaultInnerRaidus = 30;

		var radius = opts ? opts.radius || defaultRadius : defaultRadius;
		var innerRadius = opts ? opts.innerRadius || defaultInnerRaidus : defaultInnerRaidus;

		var width = opts ? opts.width || $(selector).width() :  $(selector).width();
		var height = opts ? opts.height || (width*ratio) :  (width*ratio);

		var arc = d3.svg.arc()
		    .outerRadius(radius)
		    .innerRadius(innerRadius);

		var pie = d3.layout.pie()
		    .sort(null)
		    .value(function(d) { return d.population; });

		var domain = ["positive-grades", "negative-grades", "not-evaluated-grades"];

		  data.forEach(function(d) {
     		d.total = d["not-evaluated-grades"]+d["negative-grades"]+d["positive-grades"];
		    d.values = domain.map(function(name) {
		      var perc = d3.round((+d[name])/(+d["total"])*100,1)+"%";
		      return { name: name, population: +d[name], perc: perc};
		    });
		  });

		  var legend = d3.select(selector).append("svg")
		      .attr("class", "legend-text")
		      .attr("width", 150)
		      .attr("height", radius * 2)
		    .selectAll("g")
		      .data(domain.slice().reverse())
		    .enter().append("g")
		      .attr("transform", function(d, i) { return "translate("+(0)+"," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("width", 12)
		      .attr("height", 12)
		      .attr("class", function(d) { return "donut-"+d; });

		  legend.append("text")
		      .attr("x", 16)
		      .attr("y", 6)
		      .attr("dy", ".35em")
		      .text( function(d) { return lng[d]; });

		  var svg = d3.select(selector).selectAll(".donut")
		      .data(data)
		    .enter().append("svg")
		      .attr("class", "donut")
		      .attr("width", radius * 2)
		      .attr("height", radius * 2)
		    .append("g")
		      .attr("transform", "translate(" + radius + "," + radius + ")");

		  svg.selectAll(".donut-arc")
		      .data(function(d) { return pie(d.values); })
		    .enter().append("path")
		      .attr("title", function(d) { return d.data.perc; })
		      .attr("class", function(d) { return "tip donut-arc donut-"+d.data.name; })
		      .attr("d", arc);

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

	var boxPlot = function(data, selector, opts) {
		var boxPlot = util.computeMinMaxAndQuartiles(data.grades, "grade");

		var ratio = 3/4;
		var defaultBoxWidth = 20;
		var defaultWidth = defaultBoxWidth*5;
		var defaultHeight = 300;

		var width = opts ? opts.width || defaultWidth : defaultWidth;
		var height = opts ? opts.height || defaultHeight : defaultHeight;
		var boxWidth = opts ? opts.boxWidth || defaultBoxWidth : defaultBoxWidth;

		var svg = d3.select(selector)
					.append("svg")
				      .attr("width", width)
				      .attr("height", height);

		svg.append("line")
			.attr("class", "boxplot-line")
			.attr("x1", (width/2))
			.attr("x2", (width/2))
			.attr("y1", 0)
			.attr("y2", height);

		var computeRelativeY = function(realY, realMinY, realMaxY) {
			return height - ((height * realY) / (realMaxY - realMinY));
		};

		var drawQuantileLine = function(svg, yValue) {
			svg.append("line")
				.attr("class", "boxplot-quantile-line")
				.attr("x1", (width/2)-(boxWidth/2))
				.attr("x2", (width/2)+(boxWidth/2))
				.attr("y1", yValue)
				.attr("y2", yValue);
		}

		var writeText = function(svg, text, yValue, clazz) {
			svg.append("text")
				.attr("class", "boxplot-quantile-text "+clazz)
				.attr("x", 0)
				.attr("y", yValue)
				.text(text);
		};

		var q1y = computeRelativeY(boxPlot.q1, boxPlot.min, boxPlot.max);
		var q2y = computeRelativeY(boxPlot.q2, boxPlot.min, boxPlot.max);
		var q3y = computeRelativeY(boxPlot.q3, boxPlot.min, boxPlot.max);

		//appends rectangle separating quantiles q3 and q1
		svg.append("rect")
			.attr("stroke", "black")
			.attr("fill", "white")
			.attr("x", (width/2)-(boxWidth/2))
			.attr("y", q3y)
			.attr("width", boxWidth)
			.attr("height", q1y - q3y);

		//appends max line
		drawQuantileLine(svg, 0);

		//appends median line
		drawQuantileLine(svg, q2y);

		//appends min line
		drawQuantileLine(svg, height);

		writeText(svg, boxPlot.max, 10, "boxplot-max-text");
		writeText(svg, boxPlot.q3, q3y+5, "boxplot-q3-text");
		writeText(svg, boxPlot.q2, q2y+5, "boxplot-q2-text");
		writeText(svg, boxPlot.q1, q1y+5, "boxplot-q1-text");
		writeText(svg, boxPlot.min, height, "boxplot-min-text");	
	};

	var sunburst = function(data, selector, opts) {

		var defaultWidth = 300;
		var defaultHeight = 250;

		var width = opts ? opts.width || defaultWidth : defaultWidth;
		var height = opts ? opts.height || defaultHeight : defaultHeight;
		var radius = Math.min(width, height) / 2;

		var totalSize = data.marksheet.grades.length;

		var lng = i18n.t("sunburst", { returnObjectTrees: true });

		var injectOwnGradeFlag = function(json, isDatum) {
			if(isDatum) {
				json.studentGrade = true;
			}
		};

		var buildGradeHierarchy = function(data, studentId) {
			var onlyFlunked = false;
			var root = { name: "root", children : [] };
			var approved = { name: "approved", children: [] };
			var flunked = { name: "flunked", children: [] };
			var notEvaluated = { name: "not-evaluated", children: [] };
			var a1h = { name: "10-14", children: [] };
			var a2h = { name: "15-20", children: [] };
			var f1h = { name: "0-4", children: [] };
			var f2h = { name: "5-9", children: [] };
			$.each(data, function(i, datum) {
				var grade = datum.grade;
				var isStudentGrade = datum.id === studentId;
				if(grade === "NE") {
					notEvaluated.children.push(datum);
					injectOwnGradeFlag(notEvaluated, isStudentGrade);
				} else if(grade === "RE" || d3.round(grade,0) < 10) {
					if(grade === "RE") {
						onlyFlunked = true;
						flunked.children.push(datum);
						injectOwnGradeFlag(flunked, isStudentGrade);
					} else if(d3.round(grade,0) <= 4) {
						injectOwnGradeFlag(f1h, isStudentGrade);
						f1h.children.push(datum);
					} else {
						injectOwnGradeFlag(f2h, isStudentGrade);
						f2h.children.push(datum);
					}
				} else {
					if(d3.round(grade,0) <= 14) {
						injectOwnGradeFlag(a1h, isStudentGrade);

						a1h.children.push(datum);
					} else {
						injectOwnGradeFlag(a2h, isStudentGrade);

						a2h.children.push(datum);
					}
				}
			});
			a1h.size = a1h.children.length;
			a2h.size = a2h.children.length;
			f1h.size = f1h.children.length;
			f2h.size = f2h.children.length;
			a1h.data = a1h.children;
			a1h.data = a2h.children;
			f1h.data = f1h.children;
			f2h.data = f2h.children;
			a1h.children = undefined;
			a2h.children = undefined;
			f1h.children = undefined;
			f2h.children = undefined;
			approved.children.push(a2h);
			approved.children.push(a1h);
			approved.size = a1h.size + a2h.size;
			if(onlyFlunked) {
				flunked.size = flunked.children.length;
				flunked.children = undefined;
			} else {
				flunked.children.push(f2h);
				flunked.children.push(f1h);
				flunked.size = f1h.size + f2h.size;
			}

			notEvaluated.size = notEvaluated.children.length;
			notEvaluated.children = undefined;
			root.children.push(approved);
			root.children.push(flunked);
			root.children.push(notEvaluated);
			return root;
		};

		var vis = d3.select(selector).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("id", "container")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var partition = d3.layout.partition()
		    .size([2 * Math.PI, radius * radius])
		    .value(function(d) { return d.size; });

		var arc = d3.svg.arc()
		    .startAngle(function(d) { return d.x; })
		    .endAngle(function(d) { return d.x + d.dx; })
		    .innerRadius(function(d) { return Math.sqrt(d.y); })
		    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

		var overarc = d3.svg.arc()
		  .startAngle(function(d) { return d.x+5; })
		    .endAngle(function(d) { return d.x + d.dx+5; })
		    .innerRadius(function(d) { return Math.sqrt(d.y); })
		    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

	    vis.append("circle")
	      .attr("r", radius)
	      .style("opacity", 0);

	    var studentD = undefined;
	    var json = buildGradeHierarchy(data.marksheet.grades, data.studentId);
		var nodes = partition.nodes(json);
		var path = vis.data([json]).selectAll("path")
	      .data(nodes)
	      .enter().append("path")
	      .attr("display", function(d) { return d.depth ? null : "none"; })
	      .attr("d", arc)
	      .attr("title", function(d) { return d.size+"/"+totalSize; })
	      .attr("class", function(d) {
	      	var classes = "sunburst-path tip sunburst-path-"+d.name;
	      	if(d.studentGrade) {
				studentD = d;
	      		classes = classes+" sunburst-own-grade";
	      	}
	      	return classes;
	      })
	      .attr("fill-rule", "evenodd")
	      .style("opacity", function(d) { return d.studentGrade?1:0.3; })
	      .on("mouseover", function(d) {
	      	$(".sunburst-path").attr("style", "opacity: 0.3");
	      	$(this).attr("style", "opacity: 1");
	      	$(".sunburst-percentage", selector).text(d3.round((d.value/totalSize)*100, 1)+"%");
	      	$(".sunburst-text", selector).text(lng[d.name]);
	      })
	      .on("mouseout", function(d) {
	      	$(this).attr("style", "opacity: 0.3");
	      	$(".sunburst-own-grade").attr("style", "opacity: 1");
	      	$(".sunburst-percentage", selector).text(d3.round((studentD.value/totalSize)*100, 1)+"%");
	      	$(".sunburst-text", selector).text(lng[studentD.name]);
	      });

		vis.append("text")
			.attr("class", "sunburst-percentage")
			.attr("text-anchor", "middle");
		
		vis.append("text")
			.attr("y", 20)
			.attr("class", "sunburst-text")
			.attr("text-anchor", "middle");
	
		$(".sunburst-percentage", selector).text(d3.round((studentD.value/totalSize)*100, 1)+"%");
      	$(".sunburst-text", selector).text(lng[studentD.name]);

		$(".tip").qtip({
			style: "qtip-tipsy",
			position: {
            	target: 'mouse',
            	adjust: { x: 10, y: 10 }
         	}
   		});

	};

	var progressBars = function(data, selector, opts) {
		var defaultWidth = 400;
		var defaultHeight = 400;

		var width = opts ? opts.width || defaultWidth : defaultWidth;
		var height = opts ? opts.height || defaultHeight : defaultHeight;

		var svgContainer = d3.select(selector).append("svg")
							.attr("width", width)
							.attr("height", height);

		var createBar = function(container, x, y, value, maxValue, barHeight, wrappingBarHeight, text, innerBarClass, outerBarClass) {

			var barContainer = container
				.append("g")
				.attr("transform", "translate("+x+","+y+")")
				.attr("y", y);

				//outer bar
				barContainer.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", width)
					.attr("height", wrappingBarHeight)
					.attr("class", "progress-bar progress-outer-bar "+outerBarClass);

				//inner bar
				barContainer.append("rect")
					.attr("x", 0)
					.attr("y", ((wrappingBarHeight - barHeight)/2))
					.attr("width", (value/maxValue)*width)
					.attr("height", barHeight)
					.attr("class", "progress-bar progress-inner-bar "+innerBarClass)
					.attr("data-powertip", function(d) { return value+" of "+maxValue; });

				//bar text
				barContainer.append("text")
					.attr("x", -50)
					.attr("y", (wrappingBarHeight/2)+5)
					.text(text);

			return barContainer;
		}
		//creating main progress bar
		createBar(svgContainer, 50, 0, data["total-credits"], data["max-credits"], 20, 40, "Total", "progress-main", "progress-main");

		//create years progress bars
		$.each(data["years"], function(i, year) {
			var bar = createBar(svgContainer, 50, ((i+1)*25)+20, year["credits"], data["max-credits"], 10, 20, year["year"]+" Ano", "progress-year", "progress-year");
			bar.on("click", function() {
				console.log(year["completed-courses"]);
			});
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
		},
		showEvaluationBoxPlot : function(data, selector, opts) {
			boxPlot(data, selector, opts);
		},
		showEvaluationSunburst : function(data, selector, opts) {
			sunburst(data, selector, opts);
		},
		showStudentProgress : function(data, selector, opts) {
			progressBars(data, selector, opts);
		}
	};

	SViz.init = function(params) {
		if(params) {
			if(params.lang) {
				i18nOpts.lng = params.lang;
			}
			if(params.localesBasePath) {
				i18nOpts.localesBasePath = params.localesBasePath;
			}
			if(params.debug) {
				DEBUG_MODE = params.debug;
			}
		}
	};

	var initializeSViz = function() {
		i18nOpts.resGetPath = i18nOpts.localesBasePath + i18nOpts.localesRelPath;
		i18n.init(i18nOpts, function() { log.debug("i18n initialized"); });
		svizIsNotInitialized = false;
	};

	SViz.loadViz = function(vizName, data, selector, opts) {
		if(svizIsNotInitialized) {
			log.debug("SViz is not initialized. Initializing...");
			initializeSViz();
		}
		if (visualizations[vizName] !== "undefined") {
			if(typeof data === "object") {
				visualizations[vizName](data, selector, opts);
			} else {
				d3.json(data, function(data) {
					visualizations[vizName](data, selector, opts);
				});
			}
		} else {
			log.error("Visualization named '"+vizName+"' not found.");
		}
	};

})(this, jQuery, d3, i18n);
