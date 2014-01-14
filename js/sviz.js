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
		info : function(msg, obj) {
			console.log("[SViz Info] - " + msg);
			if(typeof obj !== "undefined") {
				console.log(obj);
			}
		},
		debug : function(msg, obj) {
			if(DEBUG_MODE) {
				console.log("[SViz Debug] - " + msg);
				if(typeof obj !== "undefined") {
					console.log(obj);
				}			
			}
		},
		error : function(msg, obj) {
			console.log("[SViz Error] - " + msg);
			if(typeof obj !== "undefined") {
				console.log(obj);
			}
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
		},
		binData : function (data, frequency) { // requiers minGrade, maxGrade, and students array with .grade. Supports optional ranks
			var values = d3.layout.histogram()
				.range([data.minGrade-0.5, data.maxGrade+0.5])
				.bins(data.maxGrade - data.minGrade +1)
				.frequency(frequency)
				.value(function(d) { return d.grade; })
				(data.grades);
			var numRanks = data.ranks? data.ranks.length : 0;
			var dataLength = data.grades.length;
			if(numRanks>0) {
				var rankValues = [], bin, v, k = frequency? 1 : 1/dataLength;
				for (var i=0 ; i<numRanks ; i++) {
					bin = rankValues[i] = [];
					bin.x = data.minGrade - numRanks+i -0.5;
					bin.dx = 1;
					bin.y = 0;
					bin.label = data.ranks[i];
				}
				for (var i=0 ; i<dataLength ; i++) {
					v = data.grades[i];
					for (var j=0 ; j<numRanks ; j++) {
						if (v.grade === data.ranks[j]) {
							bin = rankValues[j];
							bin.y += k;
							bin.push(v);
							break;
						}
					}
				}
				values = rankValues.concat(values);
			}
			values.forEach(this.sortBinElements);
			return values;
		},
		truncate: function(str, maxLength, suffix) {
			if(str.length > maxLength) {
				str = str.substring(0, maxLength + 1); 
				str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
				str = str + suffix;
			}
			return str;
		},
		/* Sorting */
		comparator: function(a, b) {
			if (a.grade > b.grade) return 1;
			if (a.grade < b.grade) return -1;
			// equal grades, solve by ID
			if (a.id > b.id) return 1;
			if (a.id < b.id) return -1;
			return 0;
		},
		sortBinElements: function(element, index, array) {
			element.sort(this.comparator);
		}
	};


	/**
	 * Definition of Visualization Object to be Extended
	 **/

	var Visualization = {};
	Visualization.extend = function(extension) {
		var self = {};
		var visUpdate = (typeof extension.update === "function") ? extension.update : function() {
			log.info("No method to update this visualization was defined.");
		};
		var update = function(newData, opts) {
			if(typeof newData === "object") {
				visUpdate.call(self, newData, opts);
			} else {
				d3.json(newData, function(newData) {
					visUpdate.call(self, newData, opts);
				});
			}
		};
		$.extend(self, extension);
		return function(data, selector, opts) {
			self.initialize(data, selector, opts);
			self.render();
			return { "update": update };
		}
	};

	/**
	 * Visualizations Definition
	 **/

	var evaluationStatisticsVisualization = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = opts;

			if(!opts) var opts={};
			//if opts.help
			var lng = i18n.t("evaluation-statistics", { returnObjectTrees: true });
		 	d3.select(selector).append("h4").text(lng["title"]);
		 	var totalStudents = data.grades.length;
		 	var approvedStudents = d3.sum(data.grades, function(el) {return (el.grade >= data.minRequiredGrade);});
		 	var noAttendStudents = d3.sum(data.grades, function(el) {return (el.grade === data.notAttended);});
		  	if(opts.total!=false) {d3.select(selector).append("p").text( lng["total-students"] + totalStudents);}
		  	if(opts.approved!=false) {d3.select(selector).append("p").text( lng["approved"]	+ d3.round(approvedStudents*100/totalStudents, 1) + "%  ("+approvedStudents+" "+i18n.t("students")+")");}
		  	if(data.notAttended && opts.noattend!=false) {
		  		d3.select(selector).append("p")
		  			.text( lng["no-attends"] + d3.round(noAttendStudents*100/totalStudents, 1) + "%  ("+noAttendStudents+" "+i18n.t("students")+")");
		  	}
		  	if(opts.mean!=false) {d3.select(selector).append("p").text( lng["mean"] + d3.round(d3.mean(data.grades, util.valuesInsideDomainOnly(data)), 2));}
		  	if(opts.extent!=false) {d3.select(selector).append("p").text( lng["extent"] + d3.extent(data.grades, util.valuesInsideDomainOnly(data)));}
		  	if(opts.median!=false) {d3.select(selector).append("p").text( lng["median"] + d3.round(d3.median(data.grades, util.valuesInsideDomainOnly(data)), 2));}
		}
	});

	var histogramVisualization = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

			if(!opts) var opts={};
			if(!opts.barWidth) {opts.barWidth=0.9;} else if(opts.barWidth>1 || opts.barWidth<=0) {opts.barWidth=0.9; log.info("[Histogram] Option barWidth has an impossible value. It must be between ]0;1]. Setting to default value of "+opts.barWidth+".");}
			if(!opts.barNumbers) {opts.barNumbers="count";}
			if(!opts.tipNumbers) {opts.tipNumbers="percent";}

			var getRightTypeOfNumber = function (y, opt) {
				if(opt === "count") {
					return opts.barNumbers==="count"? y : (y*data.grades.length/100);
				} else if (opt === "percent") {
					return opts.barNumbers==="count"? (y*100/data.grades.length) : y;
				}
			}
			var getCountFromPercent = function (y) {
				return y*data.grades.length/100;
			}
			var getPercentFromCount = function (y) {
				return y*100/data.grades.length;
			}

			var percentFormat= function(number, rounding) {
				return d3.round(number*100, rounding);
			}

			var lng = i18n.t("histogram", { returnObjectTrees: true });

			/* Margins and SVG container */
			var margin = {top: 10, right: 10, bottom: 20, left: 30}, xgap = 60,
				width1 = 570 - margin.left - xgap/2,
				width2 = 240 - xgap/2 - margin.right,
				height = 260 - margin.top - margin.bottom;

			var frame = d3.select(selector).append("svg")
			  .attr("width", width1 + width2 + xgap + margin.left + margin.right)
			  .attr("height", height + margin.top + margin.bottom);
			var svg = frame.append("g")
			  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			/* Setting up scales and bins */
			var x = d3.scale.linear();

			var xr = d3.scale.ordinal();
			if(data.ranks) {
			  xr.domain(data.ranks);
			}

			var y = d3.scale.linear()
			  .rangeRound([height, 0]);

			var numRanks, numBars, barPossibleWidth, barWidth;
			var setScales = function (data) {
			  numRanks = data.ranks? data.ranks.length : 0;
			  numBars = data.maxGrade - data.minGrade + 1 + numRanks;
			  barPossibleWidth = Math.floor(width1/numBars);
			  barWidth = barPossibleWidth * opts.barWidth;
			  var roundingerror = width1 - barPossibleWidth*numBars;
			  x.domain([data.minGrade-0.5, data.maxGrade+0.5])
			    .rangeRound([numRanks*barPossibleWidth, width1-roundingerror]);
			  xr.rangeRoundBands([0, numRanks*barPossibleWidth], 1-opts.barWidth);
			}
			setScales(data);
			var values = util.binData(data, (opts.barNumbers!=="percent"));
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

			/** Bars - Main **/
			var highlightStudent = function(data) {
			  return function(d) {
			    if(data.student.id && opts.highlightStudent!=false) {
			      for(var i in d) {
			        if(!(i in {'x':1, 'dx':1, 'y':1, 'label':1})) {
			          if(d[i].id == data.student.id) {
			            return "tip bar you";
			    }}}}
			    return "tip bar";
			  }
			}

			var bar = svg.selectAll(".bar")
			    .data(values)
			  .enter().append("g")
			    .attr("class", highlightStudent(data))
 			    .attr("title", function(d){ if(opts.tooltip!=false && opts.tipNumbers!='none') { return (opts.tipNumbers=='count' ? getCountFromPercent(d.y) : (percentFormat(getPercentFromCount(d.y),2)+"%"));} })
			    .attr("transform", function(d) { return "translate(" + x(d.x+0.5) + "," + y(d.y) + ")"; })
			    .on('mouseover', function (d) {
			      if(opts.details!=false) { schover.remove(); updateSideChart(d, sideValues.range([d.x, d.x+1])(d)); }
			      if(opts.table!=false) { thover.remove(); updateTable(d); }
			    });
			bar.append("rect")
			  .attr("x", -barWidth/2)
			  .attr("width", barWidth)
			  .attr("height", function(d) { return height - y(d.y); });

			/* number inside bars */
			if(opts.barNumbers!='none') {
			  bar.append("text")
			    .attr("dy", ".75em")
			    .attr("y", 6)
			    .attr("x", 0)
			    .attr("text-anchor", "middle")
			    .text(function(d) { if(d.y!=0) { return (opts.barNumbers=='percent'? percentFormat(d.y,0)+"%" : d.y); } });
			}

			/* Tooltip */
			if(opts.tooltip!=false && opts.tipNumbers!='none') {
			  $(".tip").qtip({
			    style: "qtip-tipsy",
			    position: { my: 'bottom middle', at: 'top middle'}
			  });
			}

			/* min Grade Line */
			if(data.minRequiredGrade && opts.showMinGrade!=false) {
			  svg.append("g")
			    .attr("id", "minGradeLine")
			    .attr("class", "line")
			    .attr("transform", function(d) { return "translate(" + x(data.minRequiredGrade) + ", 0)"; })
			    .append("line")
			      .attr("x1", 0)
			      .attr("x2", 0)
			      .attr("y1", 0)
			      .attr("y2", height);
			}

			/* mean Line */
			if(opts.showMean!=false) {
			  var mean = d3.round( d3.mean(data.grades, util.valuesInsideDomainOnly(data)), 2 );
			  svg.append("g")
			    .attr("class", "mean")
			    .attr("transform", function(d) { return "translate(" + x(mean) + ", 0)"; })
			    .append("line")
			      .attr("x1", 0)
			      .attr("x2", 0)
			      .attr("y1", 0)
			      .attr("y2", height);
			}

			/* x Axis */
			if(opts.xAxis!=false) {
			  //linear x
			  var xAxis = d3.svg.axis()
			    .scale(x)
			    .tickValues(d3.range(data.minGrade, data.maxGrade+1))
			    .orient("bottom")
			    .tickFormat(d3.format("d"))
			    .outerTickSize(0);

			  var g = svg.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(xAxis);
			  if(opts.xAxisLabel!=false) {
			    g.append("text")
			      .attr("class", "label")
			      .attr("x", width1)
			      .attr("y", -6)
			      .text("Grade");
			  }

			  // ordinal x - for ranks
			  var xrAxis = d3.svg.axis()
			    .scale(xr)
			    .orient("bottom")
			    .outerTickSize(0);

			  svg.append("g")
			    .attr("class", "xr axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(xrAxis);
			}

			/* y Axis */
			if(opts.yAxis!=false) {
			  var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
			    .tickFormat(function(d){return opts.barNumbers==="percent"? percentFormat(d,0) : d;});

			  var g = svg.append("g")
			    .attr("class", "y axis")
			    .call(yAxis);
			  if(opts.yAxisLabel!=false) {
			    if(opts.barNumbers==="percent") {
			      g.append("text")
			        .attr("class", "label")
			        .attr("x", 15)
			        .attr("dy", ".71em")
			        .text("%");
			    } else { //count or none
			      g.append("text")
			        .attr("class", "label")
			        .attr("transform", "rotate(-90)")
			        .attr("y", 6)
			        .attr("dy", ".71em")
			        .text(lng['y-label']);
			    }
			  }
			}

			/* Legend */
			if(opts.legend==="side") {
			  var legend = svg.append("g")
			    .attr("class", "legend")
			    .attr("transform", "translate(0,0)");

			  var dy=0;
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
			    dy+=20;
			  }
			  if(opts.showMean!=false) {
			    var l = legend.append("g").attr("transform", "translate("+(width1-18)+","+dy+")");
			    l.append("line")
			      .attr("x2", 18)
			      .attr("y1", 9)
			      .attr("y2", 9)
			      .attr("class", "mean");
			    l.append("text")
			      .attr("x", -6)
			      .attr("y", 9)
			      .attr("dy", ".35em")
			      .style("text-anchor", "end")
			      .text(lng['mean']);
			    dy+=20;
			  }
			  if(data.student.id && opts.highlightStudent!=false) {
			    var l = legend.append("g").attr("transform", "translate("+(width1-18)+","+dy+")");
			    l.append("rect")
			      .attr("width", 18)
			      .attr("height", 18)
			      .style("fill", "purple");
			    l.append("text")
			      .attr("x", -6)
			      .attr("y", 9)
			      .attr("dy", ".35em")
			      .style("text-anchor", "end")
			      .text(lng['self-id']);
			  }
			}
			if(opts.legend==="arrows") {
			  if(data.minRequiredGrade && opts.showMinGrade!=false) {
			    d3.select("#minGradeLine").append("g")
			      .attr("transform", "translate("+10+","+10+")")
			      .append("text")
			        .attr("x", -6)
			        .attr("y", 9)
			        .attr("dy", ".35em")
			        .text(lng['min-grade']);
			  }
			  if(opts.showMean!=false) {
			    d3.select(".mean").append("g")
			      .attr("transform", "translate("+10+","+30+")")
			      .append("text")
			        .attr("x", -6)
			        .attr("y", 9)
			        .attr("dy", ".35em")
			        .text(lng['mean']);
			  }
			  if(data.student.id && opts.highlightStudent!=false) {
			    d3.select(".you").append("g")
			      .attr("transform", "translate(0,-30)")
			      .append("text")
			      .attr("x", -6)
			      .attr("y", 9)
			      .attr("dy", ".35em")
			      .style("text-anchor", "end")
			      .text(lng['self-id']);
			  }
			}

			/** Side Chart **/
			if(opts.details!=false) {
			  var sideChart = frame.append("g").attr("transform", "translate("+(margin.left+width1+xgap)+","+margin.top+")");

			  /* Setting up scales */
			  var x2 = d3.scale.linear()
			    .domain([])
			    .rangeRound([0,width2]);

			  var barWidth2 = width2/10/2;
			  if(opts.detailsBarWidth) {
			    if(opts.detailsBarWidth>=3 && opts.detailsBarWidth<=width2/10) {
			      barWidth2 = opts.detailsBarWidth;
			    } else {
			      log.info("[Histogram] Option detailsBarWidth has an impossible value. It must be between "+3+" and "+width2/10+". Setting to default value of "+barWidth2+".");
			    }
			  }

			  /* x Axis */
			  var xAxis2 = d3.svg.axis()
			    .scale(x2)
			    .ticks(10)
			    .orient("bottom");

			  sideChart.append("g")
			    .attr("class", "x2 axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(xAxis2)

			  var fo = sideChart.append("foreignObject")
			    .attr("width", width2)
			    .attr("height", height)
			    .attr("class", "temporary")
			    .attr("y", height/2 - 14*2)
			  var schover = fo.append("xhtml:div")
			      .style("text-align", "center")
			      .html(lng['hover-text']);

			  /* bars */
			  var sideValues = d3.layout.histogram()
			    .range([data.minGrade, data.maxGrade])
			    .bins(10)
			    .frequency((opts.barNumbers!=="percent"))
			    .value(function(d) { return d.grade; });

			  function updateSideChart(d, sideValues) {
			    // update scale and axis
			    x2.domain([d.x, d.x+1]);
			    xAxis2.tickFormat(function(p) { if( (p===d.x || p===d.x+0.5 || p===d.x+0.9) && (p>=data.minGrade && p<=data.maxGrade) ) { return p; } });
			    var min = d.x >= data.minGrade ? d.x : data.minGrade;
			    var max = d.x+1 >= data.maxGrade ? data.maxGrade+0.1 : d.x+1.1;
			    xAxis2.tickValues(d3.range(min, max, 0.1));
			    sideChart.select(".x2").call(xAxis2);

			    // DATA JOIN - Join new data with old elements, if any.
			    var sbar = sideChart.selectAll(".bar")
			      .data(sideValues);

			    // ENTER - Create new elements as needed.
			    sbar.enter().append("g")
			      .attr("transform", function(d) { return "translate(" + x2(d.x) + ",0)"; })
			      .append("rect")
			        .attr("x", 1- barWidth2/2)
			        .attr("width", barWidth2 -2);

			    // UPDATE - Update new and old elements
			    sbar.attr("class", highlightStudent(data));
			    sbar.select("rect")
			      .attr("y", function(d) { return y(d.y); })
			      .attr("height", function(d) { return height - y(d.y); });

			    // EXIT - Remove old elements as needed.
			    sbar.exit().remove();
			  }

			  function resetSideChart() {
			    x2.domain([]);
			    sideChart.select(".x.axis").call(xAxis2);
			    sideChart.selectAll(".bar").remove();
			    fo.append("xhtml:div").append(function(){ return schover.remove()[0][0]; });
			  }
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
			  var thover= tbody.append("tr").append("td")
			      .attr("colspan", columns.length)
			      .attr("class", "temporary")
			      .style("text-align", "center")
			      .text(lng['hover-text']);

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

			  function resetTable() {
			    tbody.selectAll("tr").remove();
			    tbody.append("tr").append(function(){ return thover.remove()[0][0]; });
			  }
			}

			this.myUpdate = function (newData) {
			  this.data = newData;
			  //resetting scales and bins
			  setScales(newData);
			  values = util.binData(newData, (opts.barNumbers!=="percent"));
			  xAxis.tickValues(d3.range(newData.minGrade, newData.maxGrade+1));
			  xr.domain(newData.ranks? newData.ranks : []);
			  xrAxis.scale(xr);
			  y.domain([0, d3.max(values, function(d) { return d.y; })]);
			  //animation
			  var duration = 750;
			  var dstep = 25;
			  var delay = function(d, i) { return i * dstep; };
			  var transition = svg.transition().duration(duration+dstep*numBars);
			  //animating scales and bins
			  transition.select(".x").call(xAxis);
			  transition.select(".xr").call(xrAxis);
			  transition.select(".y").call(yAxis);



			  //changing bars around
			  var bar = svg.selectAll(".bar")
			      .data(values);


			  var newbar = bar.enter().append("g")
			    .attr("class", highlightStudent(newData))
			    .on('mouseover', function (d) {
			      if(opts.details!=false) { schover.remove(); updateSideChart(d, sideValues.range([d.x, d.x+1])(d)); }
			      if(opts.table!=false) { thover.remove(); updateTable(d); }
			    });
			  newbar.append("rect");
			  if(opts.barNumbers!='none') {
			    newbar.append("text")
			      .attr("dy", ".75em")
			      .attr("y", 6)
			      .attr("x", 0)
			      .attr("text-anchor", "middle");
			  }

			  bar.transition().delay(delay).duration(duration)
			    .attr("class", highlightStudent(newData))
			    .attr("transform", function(d) { return "translate(" + x(d.x+0.5) + "," + y(d.y) + ")"; });
			  bar.attr("title", function(d){ if(opts.tooltip!=false && opts.tipNumbers!='none') { return opts.tipNumbers=='count' ? getCountFromPercent(d.y) : (percentFormat(getPercentFromCount(d.y),2)+"%") ; } });
			  bar.select("rect")
			      .attr("x", 1- barWidth/2)
			      .attr("width", barWidth -2)
			      .attr("height", function(d) { return height - y(d.y); });
			  bar.select("text").text(function(d) { if(d.y!=0) { return (opts.barNumbers=='percent'? percentFormat(d.y,0)+"%" : d.y); } });

			  bar.exit().remove();

			  if(opts.tooltip!=false && opts.tipNumbers!='none') {
			    $(".tip").qtip({
			      style: "qtip-tipsy",
			      position: { my: 'bottom middle', at: 'top middle'}
			    });
			  }

			  //update minRequiredGrade
			  if(data.minRequiredGrade && opts.showMinGrade!=false) {
			    transition.select(".minRect").attr("width", x(newData.minRequiredGrade));
			    transition.select(".line").attr("transform", function(d) { return "translate(" + x(newData.minRequiredGrade) + ", 0)"; })
			  }
			  //update mean
			  if(opts.showMean!=false) {
			    var mean = d3.round( d3.mean(newData.grades, util.valuesInsideDomainOnly(newData)), 2 );
			    transition.select(".mean").attr("transform", function(d) { return "translate(" + x(mean) + ", 0)"; })
			  }
			  //updating detailed views
			  if(opts.details!=false) { resetSideChart(); }
			  if(opts.table!=false) { resetTable(); }
			};
	 	},

	 	update: function(newData, opts) {
	 		this.myUpdate(newData);
	 	}

	});

	var multipleDonutsVisualization = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

			var lng = i18n.t("donuts", { returnObjectTrees: true });
			log.debug("Invoked Multiple Donuts Visualization with opts", opts);

			var ratio = 3/4;
			var defaultRadius = 60;
			var defaultInnerRaidus = 40;

			var radius = opts ? opts.radius || defaultRadius : defaultRadius;
			var innerRadius = opts ? opts.innerRadius || defaultInnerRaidus : defaultInnerRaidus;

			var width = opts ? opts.width || $(selector).width() :  $(selector).width();
			var height = opts ? opts.height || (width*ratio) :  (width*ratio);

			var showLegend = opts ? opts.showLegend === true : true;
			var legendSelector = opts ? opts.legendSelector || selector : selector;

			var arc = d3.svg.arc()
			    .outerRadius(radius)
			    .innerRadius(innerRadius);

			var pie = d3.layout.pie()
			    .sort(null)
			    .value(function(d) { return d.population; });

			data.entries.forEach(function(d) {
				var total = 0;
				$.each(data.domain, function(i, el) {
					total += +d[el];
				});
				d.total = total;
				d.values = data.domain.map(function(name) {
					var perc = d3.round((+d[name])/(+d["total"])*100,1)+"%";
					return { name: name, population: +d[name], total: total, perc: perc};
				});
			});

			if(showLegend) {
				var legend = d3.select(legendSelector).append("svg")
				  .attr("class", "legend-text")
				  .attr("width", 150)
				  .attr("height", radius * 2)
					.selectAll("g")
					  .data(data.domain.slice().reverse())
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
			}

			var svg = d3.select(selector).selectAll(".donut")
				  .data(data.entries)
				.enter().append("svg")
				  .attr("class", "donut")
				  .attr("width", radius * 2)
				  .attr("height", radius * 2)
				.append("g")
				  .attr("transform", "translate(" + radius + "," + radius + ")");

			svg.selectAll(".donut-arc")
			  .data(function(d) { return pie(d.values); })
			.enter().append("path")
			  .attr("title", function(d) { return "<center>"+lng[d.data.name]+"<br>"+d.data.perc+"<br/>"+d.data["population"]+"/"+d.data["total"]+"</center>"; })
			  .attr("class", function(d) { return "tip donut-arc donut-"+d.data.name; })
			  .attr("d", arc);

			svg.append("text")
			  .attr("dy", ".35em")
			  .attr("class", "donut-center-text tip")
			  .attr("title", function(d) { return d.description; })
			  .style("text-anchor", "middle")
			  .text(function(d) { return d.text; });

			$(".tip").qtip({
				style: "qtip-tipsy",
				position: {
				  target: 'mouse',
				  adjust: { x: 15, y: 15 }
				}
			});
		}

	});

	var boxPlot = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

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
		}
	});

	var sunburst = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;
			var defaultWidth = 300;
			var defaultHeight = 250;

			var width = opts ? opts.width || defaultWidth : defaultWidth;
			var height = opts ? opts.height || defaultHeight : defaultHeight;
			var radius = Math.min(width, height) / 2;

			var totalSize = data.grades.length;

			var lng = i18n.t("sunburst", { returnObjectTrees: true });

			var injectOwnGradeFlag = function(json, isDatum, grade) {
				if(isDatum) {
					json.studentGrade = true;
					json.studentGradeValue = grade;
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
						injectOwnGradeFlag(notEvaluated, isStudentGrade, grade);
					} else if(grade === "RE" || d3.round(grade,0) < 10) {
						if(grade === "RE") {
							onlyFlunked = true;
							flunked.children.push(datum);
							injectOwnGradeFlag(flunked, isStudentGrade, grade);
						} else if(d3.round(grade,0) <= 4) {
							injectOwnGradeFlag(f1h, isStudentGrade, grade);
							f1h.children.push(datum);
						} else {
							injectOwnGradeFlag(f2h, isStudentGrade, grade);
							f2h.children.push(datum);
						}
					} else {
						if(d3.round(grade,0) <= 14) {
							injectOwnGradeFlag(a1h, isStudentGrade, grade);

							a1h.children.push(datum);
						} else {
							injectOwnGradeFlag(a2h, isStudentGrade, grade);

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
		    var studentDGrade = undefined;
		    var json = buildGradeHierarchy(data.grades, data.student.id);
			var nodes = partition.nodes(json);
			var path = vis.data([json]).selectAll("path")
		      .data(nodes)
		      .enter().append("path")
		      .attr("display", function(d) { return d.depth ? null : "none"; })
		      .attr("d", arc)
		      .attr("title", function(d) { return "<center>"+lng[d.name]+"<br>"+d.size+" "+lng["of"]+" "+totalSize+" "+lng["students"]+"</center>"; })
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
  		      	$(".sunburst-percentage", selector).attr("y", 0);
		      	$(".sunburst-text", selector).text(lng[d.name]);
		      })
		      .on("mouseout", function(d) {
		      	$(this).attr("style", "opacity: 0.3");
		      	$(".sunburst-own-grade").attr("style", "opacity: 1");
		      	var text = (studentD.studentGradeValue !== "RE" && studentD.studentGradeValue !== "NE") ? studentD.studentGradeValue : lng[studentD.name];
		      	$(".sunburst-percentage", selector).text(text);
		      	$(".sunburst-percentage", selector).attr("y", 10);
		      	$(".sunburst-text", selector).text("");
		      });

			vis.append("text")
				.attr("class", "sunburst-percentage")
				.attr("text-anchor", "middle");
			
			vis.append("text")
				.attr("y", 20)
				.attr("class", "sunburst-text")
				.attr("text-anchor", "middle");

	      	var text = (studentD.studentGradeValue !== "RE" && studentD.studentGradeValue !== "NE") ? studentD.studentGradeValue : lng[studentD.name];
			$(".sunburst-percentage", selector).text(text);
	      	$(".sunburst-percentage", selector).attr("y", 10);
	      	$(".sunburst-text", selector).text("");

			$(".tip").qtip({
				style: "qtip-tipsy",
				position: {
	            	target: 'mouse',
	            	adjust: { x: 10, y: 10 }
	         	}
	   		});
	   	},

	   	update: function(newData, opts) {
	   		this.data = newData;
	   		$(this.selector).empty();
	   		this.render();
	   	}
	});

	var progressBars = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

			var lng = i18n.t("progress-bars", { returnObjectTrees: true });

			var defaultWidth = 600;
			var defaultHeight = data.length*50;

			var width = opts ? opts.width || defaultWidth : defaultWidth;
			var height = opts ? opts.height || defaultHeight : defaultHeight;

			var svgContainer = d3.select(selector).append("svg")
								.attr("width", width)
								.attr("height", height);

			var createBar = function(container, x, y, value, maxValue, barHeight, wrappingBarHeight, text, innerBarClass, outerBarClass) {

				var barContainer = container
					.append("g")
					.attr("transform", "translate("+x+","+y+")")
					.attr("y", y)
					.attr("class", "tip")
					.attr("title", function(d) {
						var perc = value > maxValue ? 100 : d3.round((value/maxValue)*100,1);
						return "<center>"+text+"<br>("+perc+"%) "+value+" "+lng["ects-of"]+" "+maxValue+" "+lng["required-ects"]+"</center>";
					});

					//outer bar
					barContainer.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", width-x)
						.attr("height", wrappingBarHeight)
						.attr("class", "progress-bar progress-outer-bar "+outerBarClass)
						

					//inner bar
					barContainer.append("rect")
						.attr("x", 0)
						.attr("y", ((wrappingBarHeight - barHeight)/2))
						.attr("width", (value/maxValue)*(width-x))
						.attr("height", barHeight)
						.attr("class", function() { return "progress-bar progress-inner-bar "+innerBarClass+((value>=maxValue)?"-completed":"-incomplete") });
						

					//bar text
					barContainer.append("text")
						.attr("x", -x)
						.attr("y", (wrappingBarHeight/2)+5)
						.style("cursor", "pointer")
						.text(text);

				return barContainer;
			}

			data.sort(function(a,b) {
				return a.year - b.year;
			});

			//create degree progress bars
			$.each(data, function(i, degree) {
				createBar(svgContainer, 100, ((i+1)*25)+20, degree["credits"], degree["required-credits"], 10, 20, degree["degree"], "progress-main", "progress-main");
			});

			$(".tip").qtip({
				style: "qtip-tipsy",
				position: {
	            	target: 'mouse',
	            	adjust: { x: 10, y: 10 }
	         	}
	   		});
		}
	});

	var bubbleChart = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

			var lng = i18n.t("bubbles", { returnObjectTrees: true });

			var margin = { top: 20, right: 400, bottom: 0, left: 20};
			var width = 600;
			var height = (data.entries.length*20)+15;

			var start_year = data["start-year"];
			var end_year = data["end-year"];

			var c = d3.scale.category20c();

			var x = d3.scale.linear()
				.range([0, width]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("top");

			var formatYears = d3.format("dddd");
			xAxis.tickFormat(formatYears).tickValues(d3.range(start_year, end_year+1));

			var svg = d3.select(selector).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
						.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			x.domain([start_year, end_year]);
			var xScale = d3.scale.linear()
				.domain([start_year, end_year])
				.range([0, width]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + 0 + ")")
				.call(xAxis);

			for (var j = 0; j < data.entries.length; j++) {
				var g = svg.append("g").attr("class","bubble");

				var circles = g.selectAll("circle")
					.data(data.entries[j]['years'])
					.enter()
					.append("circle");

				var text = g.selectAll("text")
					.data(data.entries[j]['years'])
					.enter()
					.append("text");

				var rScale = d3.scale.linear()
					.domain([0, d3.max(data.entries[j]['years'], function(d) { return (d[1]/(d[1]+d[2]+d[3]))*100; })])
					.range([3, 7]);

				
				circles.attr("cx", function(d, i) { return xScale(d[0]); })
						.attr("cy", j*20+20)
						.attr("r", function(d) { return rScale(d[1]); })
						.attr("class", "tip")
						.attr("title", function(d) { var perc = d3.round((d[1]/(d[1]+d[2]+d[3]))*100, 0); return "<center>"+perc+"%<br>"+lng["approved"]+"</center>" })
						.style("cursor", "pointer")
						.style("fill", function(d) { return c(j); })
						.on("mouseover", circleMouseover(data.entries[j]));

				text.attr("y", j*20+25)
					.attr("x",function(d, i) { return xScale(d[0])-5; })
					.attr("class","value")
					.text(function(d){ var perc = d3.round((d[1]/(d[1]+d[2]+d[3]))*100, 0); return perc; })
					.style("fill", function(d) { return c(j); })
					.style("display","none");

				g.append("text")
					.attr("y", j*20+25)
					.attr("x",width+20)
					.attr("class","bubbles-label")
					.text(util.truncate(data.entries[j]['name'],50,"..."))
					.style("fill", function(d) { return c(j); })
					.style("cursor", "pointer")
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);
			};

			function circleMouseover(p) {
				return function(d) {
					console.log(p);
					console.log(d);
				}
			}

			function mouseover(p) {
				var g = d3.select(this).node().parentNode;
				d3.select(g).selectAll("circle").style("display","none");
				d3.select(g).selectAll("text.value").style("display","block");
			}

			function mouseout(p) {
				var g = d3.select(this).node().parentNode;
				d3.select(g).selectAll("circle").style("display","block");
				d3.select(g).selectAll("text.value").style("display","none");
			}

			$(".tip").qtip({
				style: "qtip-tipsy",
				position: {
	            	target: 'mouse',
	            	adjust: { x: 10, y: 10 }
	         	}
	   		});

		}

	});

	var overallStatisticsVisualization = Visualization.extend({

		initialize: function(data, selector, opts) {
			this.data = data;
			this.selector = selector;
			this.opts = opts;
		},

		render: function() {
			var data = this.data;
			var selector = this.selector;
			var opts = this.opts;

			if(!opts) var opts={};
			//if opts.help
			var lng = i18n.t("overall-statistics", { returnObjectTrees: true });
			d3.select(selector).append("h4").text(lng["title"]);
			if(opts.mean!=false) {d3.select(selector).append("p").text( lng["mean"] + data.mean )}
			if(opts.extent!=false) {d3.select(selector).append("p").text( lng["extent"] + data.minGrade + " , " + data.maxGrade )}
			if(opts.approved!=false) {d3.select(selector).append("p").text( lng["approved"] + data.approved )}
			if(opts.flunked!=false) {d3.select(selector).append("p").text( lng["flunked"] + data.flunked )}
			if(opts.noattend!=false) {d3.select(selector).append("p").text( lng["no-attends"] + data.notAttended )}
		}

	});

	//VISUALIZATIONS TO EXPORT
	var visualizations = {
		showEvaluationStatistics : function(data, selector, opts) {
			return evaluationStatisticsVisualization(data, selector, opts);
		},
		showHistogram: function(data, selector, opts) {
			return histogramVisualization(data, selector, opts);
		},
		showCourses : function(data, selector, opts) {		
			return multipleDonutsVisualization(data, selector, opts);
		},
		showCourseOvertime : function(data, selector, opts) {
			return multipleDonutsVisualization(data, selector, opts);
		},
		showEvaluationBoxPlot : function(data, selector, opts) {
			return boxPlot(data, selector, opts);
		},
		showEvaluationSunburst : function(data, selector, opts) {
			return sunburst(data, selector, opts);
		},
		showStudentProgress : function(data, selector, opts) {
			return progressBars(data, selector, opts);
		},
		showOverallStatistics : function(data, selector, opts) {
			return overallStatisticsVisualization(data, selector, opts);
		},
		showCurricularCoursesOvertime: function(data, selector, opts) {
			return bubbleChart(data, selector, opts);
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
		initializeSViz();
	};

	var initializeSViz = function() {
		i18nOpts.resGetPath = i18nOpts.localesBasePath + i18nOpts.localesRelPath;
		i18n.init(i18nOpts, function() { log.debug("i18n initialized"); });
		svizIsNotInitialized = false;
	};

	SViz.loadViz = function(vizName, data, selector, opts) {
		log.debug("Loading vizualization", {vizName: vizName, data: data, selector: selector, opts: opts });
		if(svizIsNotInitialized) {
			log.debug("SViz is not initialized. Initializing...");
			initializeSViz();
		}
		if (visualizations[vizName] !== "undefined") {
			if(typeof data === "object") {
				return visualizations[vizName](data, selector, opts);
			} else {
				d3.json(data, function(data) {
					return visualizations[vizName](data, selector, opts);
				});
			}
		} else {
			log.error("Visualization named '"+vizName+"' not found.");
		}
	};

})(this, jQuery, d3, i18n);
