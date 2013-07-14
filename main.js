
      var xdomain = [-6,6]
        , p = .8
        , a = .4
        , binCount = 50
        , rec = null
        , colors = ['coral','blue']
        , interp = d3.interpolateHsl
        , dur = 150
        , n = 50000
        // A formatter for counts.
        , formatCount = d3.format(",.0f")
        , m = {
          top: 50
          , right: 30
          , bottom: 30
          , left: 75
        }
        , width = 1000 // total width
        , height = 400
        , hWidth = width / 2 - m.left - m.right // histogram width
        , hHeight = 400 - m.top - m.bottom // histogram height
        , x = d3.scale.linear()
          .domain(xdomain)
          .range([0, hWidth])

      // Generate a histogram using twenty uniformly-spaced bins.
      function ft(a, n){
        var b = Math.sqrt((1 - p * Math.pow(a, 2))/(1-p));
        var sample = [];
        d3.range(n).map(function(d){
          if (Math.random() <= p){
              sample.push(a * d3.random.normal(0,1)());
          } else {
              sample.push(b * d3.random.normal(0,1)());
          }
        })
        return sample;
      }
      
      function kurtosis(a, p){
        var b = Math.sqrt((1 - p * Math.pow(a, 2))/(1-p));
        return 3*( p * Math.pow(a,4) + (1-p) * Math.pow(b,4));
      }
      
      // find the historgram bin that corisponds to a given data value
      function binIndexFromDatum(bins, datum){
        var bin;
        for(var i = 0; i < bins.length; i++){
          bin = bins[i];
          if(bin.x < datum && datum < bin.x + bin.dx) return i;
        }
        return -1;
      }
      
      var normData = d3.range(n).map(d3.random.normal(0,1))
        , ftData = ft(a, n)
        , binize = d3.layout.histogram()
          .bins(x.ticks(binCount))
          .frequency(false)
        , data = binize(ftData)
        , normBinned = binize(normData)
        , y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([hHeight, 0]);
      
      function color(d){
        var c = d3.scale.linear()
        .domain([0 , xdomain[1]])
        .range(colors)
        .interpolate(interp)
        return c(Math.abs(d))
      }

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left');
      
      var hist2YAxis = d3.svg.axis()
        .scale(y)
        .orient('right')

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = d3.select("#frame").append("svg").classed('root-svg', true)
          .attr("width", width)
          .attr("height", height)
      
      var hist1 = svg.append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")")
        .attr('class', 'histogram1')
      
      var hist2 = svg.append("g")
        .attr("transform", "translate(" + (hWidth + m.left * 2) + "," + m.top + ")")
        .attr('class', 'histogram2')

      var b = Math.sqrt((1 - p * Math.pow(a, 2))/(1-p));

      var k = 3*( p * Math.pow(a,4) + (1-p) * Math.pow(b,4));

      var bar1 = hist1.selectAll(".bar")
        .data(data)
        .enter()
          .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
              return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .append('g')
              // a container element so we can seperately animate the opacity
              .attr('class','opacity-container')

      bar1.on("mousemove", function(d) {
        tooltip.transition().duration(200).style("opacity", .9)
        tooltip.html(d.x ).style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
      }); //end of mousover

      bar1.on("mouseout", function(d) {
          tooltip.transition()
            .duration(100)
            .style("opacity", 0);
        }); //end of the mouseout

      bar1.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx + x.domain()[0]) - 2 )
          .attr("height", function(d) { return hHeight - y(d.y); })
          .attr("stroke", "black")
          .attr("stroke-width", "1px")
          .style("fill", function(d){return color(d.x); });


      var bar2 = hist2.selectAll(".bar")
        .data(normBinned)
        .enter()
          .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
              return "translate(" + x(d.x) + "," + y(d.y) + ")";
            })
            .append('g')
              // a container element so we can seperately animate the opacity
              .attr('class','opacity-container')

      bar2.on("mouseover", function(d) {
        tooltip.transition().duration(200).style("opacity", .9)
        tooltip.html(d.x + "<br/>"  ).style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
      }); //end of mousover

      bar2.on("mouseout", function(d) {
          tooltip.transition()
            .duration(100)
            .style("opacity", 0);
        }); //end of the mouseout

      bar2.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx + x.domain()[0]) - 2 )
          .attr("height", function(d) { return hHeight - y(d.y); })
          .attr("stroke", "black")
          .attr("stroke-width", "1px")
          .style("fill", function(d){return color(d.x); });

      hist1.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + hHeight + ")")
          .call(xAxis);

      hist1.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + 0 + ",0)")
          .call(yAxis)
          .append("svg:text")
        .text("probability")
        .attr("transform", "translate(" + -45 + "," + 80 + ") rotate(-90)")
        .attr("class", "sliderLabel");

      hist1.append("g")
        .attr("class", "bigLabel")
        .attr("transform", "translate(" + (hWidth/2) + "," + (-20) + ")")
        .append("svg:text")
        .attr('text-anchor','middle')
        .text('Fat-tailed')

      hist2.append("g")
        .attr("class", "bigLabel")
        .attr("transform", "translate(" + (hWidth/2) + "," + (-20) + ")")
        .append("svg:text")
        .attr('text-anchor','middle')
        .text('Normal')
      
      hist2.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + hHeight + ")")
          .call(xAxis);

      hist2.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + (hWidth) + ",0)")
          .call(hist2YAxis);

      function redraw(a) {
        ftData = ft(a, n);
        data = binize(ftData);
        y.domain([0, d3.max(data, function(d) { return d.y; })]);

          hist1.select(".y.axis")
            .transition()
            .duration(200)
            .call(yAxis).ease('quad');

          hist1.selectAll('.bar').data(data)
            .transition().duration(300).ease('cube')
            .attr("transform", function(d) { 
              return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
            });

          hist1.selectAll('rect').data(data)
            .transition().duration(300).ease('cube')
            .attr("height", function(d) { return hHeight - y(d.y); });

          hist2.select(".y.axis")
            .transition()
            .duration(200)
            .call(hist2YAxis).ease('quad');

          hist2.selectAll('.bar').data(normBinned)
            .transition().duration(300).ease('cube')
            .attr("transform", function(d) { 
              return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
            });

          hist2.selectAll('rect').data(normBinned)
            .transition().duration(300).ease('cube')
            .attr("height", function(d) { return hHeight - y(d.y); });
      };
      
      var h2 = hHeight - 200

      var market1 = d3.select("#frame").append("svg")
          .classed('market market1', true)
          .attr("width", hWidth + m.left + m.right)
          .attr("height", h2 + 50)
        .append("g")
          .attr("transform", "translate(" + m.left + "," + 30 + ")");
      
      d3.select('.market1').append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "plotLabel")
        .attr('transform','translate(' + (m.left + hWidth/2) + ',20)')
        .text('Fat-tailed Deviations');
          
      
      var market2 = d3.select("#frame").append("svg")
          .classed('market market2', true)
          .attr("width", hWidth + m.left + m.right)
          .attr("height", h2 + 50)
        .append("g")
          .attr("transform", "translate(" + 45 + "," + 30 + ")");

      d3.select('.market2').append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "plotLabel")
        .attr('transform','translate(' + (m.left + hWidth/2 -30) + ',20)')
        .text('Normal Deviations');
      
      
      var brown1 = d3.select("#frame").append("svg")
          .classed('brown1', true)
          .attr("width", hWidth + m.left + m.right)
          .attr("height", h2 + 50)
        .append("g")
          .attr("transform", "translate(" + m.left + "," + 30 + ")");
      
      d3.select('.brown1').append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "plotLabel")
        .attr('transform','translate(' + (m.left + hWidth/2) + ',20)')
        .text('Fat-tailed Walk')

      var brown2 = d3.select("#frame").append("svg")
          .classed('brown2', true)
          .attr("width", hWidth + m.left + m.right)
          .attr("height", h2 + 50)
        .append("g")
          .attr("transform", "translate(" + 45 + "," + 30 + ")");
      
      d3.select('.brown2').append('text')
        .attr('text-anchor', 'middle')
        .attr("class", "plotLabel")
        .attr('transform','translate(' + (m.left + hWidth/2 -25) + ',20)')
        .text('Normal Walk')

      var y2 = d3.scale.linear()
        .domain(xdomain)
        .range([h2, 0]);
      
      var by1 = d3.scale.linear()
        .domain(xdomain)
        .range([h2, 0]);

      var by2 = d3.scale.linear()
        .domain(xdomain)
        .range([h2, 0]);

      var x2 = d3.scale.linear()
        .domain([0, 50])
        .range([0,hWidth])

      var plotData1 = d3.range(50).map(function(){return newFTData();})
      var plotData2 = d3.range(50).map(function(){return newNormalData();})

      var brownData1 = d3.range(50).map(function(){return 0;})
      var brownData2 = d3.range(50).map(function(){return 0;})

      for( var i = 1; i < brownData1.length; i++){
        brownData1[i] += plotData1[i] + brownData1[i-1]
      };

      for( var i = 1; i < brownData2.length; i++){
        brownData2[i] += plotData2[i] + brownData2[i-1]
      };

      var yAxis2 = d3.svg.axis()
          .scale(y2)
          .tickSize(-hWidth)
          .orient('left')
      
      var byAxis1 = d3.svg.axis()
          .scale(by1)
          .tickSize(-hWidth)
          .orient('left')

      var byAxis2 = d3.svg.axis()
          .scale(by2)
          .tickSize(-hWidth)
          .orient('left')

      var xAxis2 = d3.svg.axis()
          .scale(x2)
          .orient("bottom");

      market1.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0,0)")
          .call(yAxis2);
      
      brown1.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0,0)")
          .call(byAxis1);
      
      brown2.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0,0)")
          .call(byAxis2);
      
      market2.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0,0)")
          .call(yAxis2);

      var zeroLine1 = market1.append("line")
          .attr({ 
            x1: 0, 
            x2: hWidth, 
            y1: 0, 
            y2: 0,
            class: "zero",
            transform: "translate(0," + h2/2 + ")"
          });
          
      var bzeroLine1 = brown1.append("line")
          .attr({ 
            x1: 0, 
            x2: hWidth, 
            y1: 0, 
            y2: 0,
            class: "zero"
          });

      var bzeroLine2 = brown2.append("line")
          .attr({ 
            x1: 0, 
            x2: hWidth, 
            y1: 0, 
            y2: 0,
            class: "zero"
          });

      var zeroLine2 = market2.append("line")
          .attr({ 
            x1: 0, 
            x2: hWidth, 
            y1: 0, 
            y2: 0,
            class: "zero",
            transform: "translate(0," + h2/2 + ")"
          });

      var sdBox1 = market1.append("rect")
        .attr({
          width : hWidth,
          height : y2(-1) - y2(1),
          class : "sdBox",
          x: 0,
          y: y2(1)
        })


      var sdBox2 = market2.append("rect")
        .attr({
          width : hWidth,
          height : y2(-1) - y2(1),
          class : "sdBox",
          x: 0,
          y: y2(1)
        });

      var tooltip = d3.select("#frame").append("div") // the div used for the tooltips
        .attr("class", "tooltip")       // apply the 'tooltip' class
        .style("opacity", 0);

      var line1 = d3.svg.line()
          .x(function(d,i) { return x2(i); })
          .y(function(d) { return y2(d); });
      
      var bline1 = d3.svg.line()
          .x(function(d,i) { return x2(i); })
          .y(function(d) { return y2(d); });
      
      var bline2 = d3.svg.line()
          .x(function(d,i) { return x2(i); })
          .y(function(d) { return y2(d); });
      
      var line2 = d3.svg.line()
          .x(function(d,i) { return x2(i); })
          .y(function(d) { return y2(d); });

      function newFTData(){
        var rand = Math.round( Math.random() * ftData.length)
        var t = ftData[ rand ];
        return t;
      };
      
      function newNormalData(){
        var rand = Math.round( Math.random() * normData.length)
        var t = normData[ rand ];
        return t;
      };

      market1.append("defs").append("clipPath")
          .attr("id", "clip1")
        .append("rect")
          .attr("width", hWidth)
          .attr("height", h2);
        
      brown1.append("defs").append("clipPath")
          .attr("id", "bclip1")
        .append("rect")
          .attr("width", hWidth)
          .attr("height", h2);
      
      market2.append("defs").append("clipPath")
          .attr("id", "clip2")
        .append("rect")
          .attr("width", hWidth)
          .attr("height", h2);

      brown2.append("defs").append("clipPath")
          .attr("id", "bclip2")
        .append("rect")
          .attr("width", hWidth)
          .attr("height", h2);

      var clip1 = market1.append('g')
        .attr('clip-path','url(#clip1)');
      
      var bclip1 = brown1.append('g')
        .attr('clip-path','url(#bclip1)');
        
      var clip2 = market2.append('g')
        .attr('clip-path','url(#clip2)');
    
      var bclip2 = brown2.append('g')
        .attr('clip-path','url(#bclip2)');

      var path1 = clip1
          .append('path')
            .data([plotData1])
          .attr({
            class: 'line',
            fill: 'none',
            stroke: 'black'
          })
          .attr("d", line1)
          .classed('plotline',true);
      
      var bpath1 = bclip1
          .append('path')
            .data([brownData1])
          .attr({
            class: 'brown line',
            fill: 'none',
            stroke: 'black'
          })
          .attr("d", bline1)
          .classed('plotline',true);
          
      var bpath2 = bclip2
          .append('path')
            .data([brownData2])
          .attr({
            class: 'brown line',
            fill: 'none',
            stroke: 'black'
          })
          .attr("d", bline2)
          .classed('plotline',true);
      
      var path2 = clip2
          .append('path')
            .data([plotData2])
          .attr({
            class: 'line',
            fill: 'none',
            stroke: 'black'
          })
          .attr("d", line2)
          .classed('plotline',true);
      

      function stdDev(data){
        var ex = 0, e_x2 = 0
        for(var i in data){
          var l = data[i];
          ex += l / data.length;
          e_x2 += Math.pow(l, 2)/data.length
        };
        var ex_2 = Math.pow(ex,2);
        return Math.pow(e_x2 - ex_2, 0.5);
      }



      function plot1Anim(){
        var t = newFTData();
        
        // nth child starts at 1
        var binIndex = binIndexFromDatum(data, t) + 1;
        
        hist1.selectAll('.bar:nth-child(' + binIndex + ') .opacity-container')
          .transition()
          .duration(200)
          .ease('out')
          .attr("opacity", "0.5")
            .transition()
            .ease('sin')
            .duration(200)
            .attr("opacity", "1")
        
        plotData1.push(t);
        
        var circle = clip1.selectAll("circle")
          .data(plotData1, function(d){return d; });
        
        

        circle.enter()
          .append('circle')
          .attr({
            r: 10,
            fill: function(d){return color(d);},
            cx: function(d,i){return x2(i);},
            cy: function(d){return y2(d);},
            stroke: "black"
          });
        
        var v = stdDev(plotData1);
        
        circle.transition().duration(dur).ease('linear')
          .attr("cx", function(d,i){return x2(i -1);})
          .attr("r", "3px");
       
        circle.exit().remove();
        
        path1
          .attr("d", line1)
          .attr("transform", null)
          .transition()
            .duration(dur)
            .ease("linear")
            .attr("transform", "translate(" + x2(-1) + ",0)")
        
        // brownian plot
        
        brownData1.push(brownData1[brownData1.length - 1] + t);
        by1.domain([
          d3.min([d3.min(brownData1) - 2, xdomain[0]])
          , d3.max([d3.max(brownData1) + 2, xdomain[1]])
        ]);
        
        byAxis1.scale(by1);
        brown1.select('.y.axis').call(byAxis1);
        
       bzeroLine1
        .transition().duration()
        .attr("y1", by1(0)).attr("y2", by1(0))
        
        
        var bcircle = bclip1.selectAll("circle")
          .data(brownData1, function(d){return d; });
        
        bcircle.enter()
          .append('circle')
          .attr({
            r: 10,
            fill: '#999',
            cx: function(d,i){return x2(i);},
            cy: by1,
            stroke: "black"
          });
          
        bcircle.transition().duration(dur).ease('linear')
          .attr("cx", function(d,i){return x2(i -1);})
          .attr('cy', function(d){ return by1(d); })
          .attr("r", "3px");
        
        bcircle.exit().remove();
        
        bline1.y(by1)
        
        bpath1
          .attr("d", bline1)
          .attr("transform", null)
          .transition()
            .duration(dur)
            .ease("linear")
            .attr("transform", "translate(" + x2(-1) + ",0)")
            .each('end', plot1Anim);
        
        plotData1.shift();
        brownData1.shift();
      };

      plot1Anim();
      
      
      
      
      
      function plot2Anim(){
        
        var t = newNormalData();
        // nth css selector starts at 1
        var binIndex = binIndexFromDatum(normBinned, t) + 1;
        
        hist2.selectAll('.bar:nth-child(' + binIndex + ') .opacity-container')
          .transition()
          .duration(200)
          .ease('out')
          .attr("opacity", "0.5")
            .transition()
            .ease('sin')
            .duration(200)
            .attr("opacity", "1");
        
        plotData2.push(t);
        
        var circle = clip2.selectAll("circle")
          .data(plotData2, function(d){return d; });
        
        circle.enter()
          .append('circle')
          .attr({
            r: 10,
            fill: function(d){return color(d);},
            cx: function(d,i){return x2(i);},
            cy: function(d){return y2(d);},
            stroke: "black"
          });
      
        circle.transition().duration(dur).ease('linear')
          .attr("cx", function(d,i){return x2(i -1);})
          .attr("r", "3px");
        
        circle.exit().remove();
        
        path2
          .attr("d", line2)
          .attr("transform", null)
          .transition()
            .duration(dur)
            .ease("linear")
            .attr("transform", "translate(" + x2(-1) + ",0)")
        

         // brownian plot

         brownData2.push(brownData2[brownData2.length - 1] + t);
         
         by2.domain([
           d3.min([d3.min(brownData2) - 2, xdomain[0]])
           , d3.max([d3.max(brownData2) + 2, xdomain[1]])
         ]);

         byAxis2.scale(by2);
         brown2.select('.y.axis').call(byAxis2);

        bzeroLine2
          .transition().duration()
          .attr("y1", by2(0))
          .attr("y2", by2(0));


         var bcircle = bclip2.selectAll("circle")
           .data(brownData2, function(d){ return d; });

         bcircle.enter()
           .append('circle')
           .attr({
             r: 10,
             fill: '#999',
             cx: function(d,i){return x2(i);},
             cy: by2,
             stroke: "black"
           });

         bcircle.transition().duration(dur).ease('linear')
           .attr("cx", function(d,i){ return x2(i - 1);})
           .attr('cy', function(d){ return by2(d); })
           .attr("r", "3px");

         bcircle.exit().remove()

         bline2.y(by2)

         bpath2
           .attr("d", bline2)
           .attr("transform", null)
           .transition()
             .duration(dur)
             .ease("linear")
             .attr("transform", "translate(" + x2(-1) + ",0)")
             .each('end', plot2Anim);

         plotData2.shift();
         brownData2.shift();

      }
      plot2Anim()

    
      ;(function setupSlider(){
        var sliderY = d3.scale.linear().domain([0.1, 1]).range([30,300]);
        var sliderAxis = d3.svg.axis()
          .scale(sliderY)
          .orient("left")
          .ticks(10)
          .tickFormat(function(d){
            return d3.round(kurtosis(d, p),1);
          });

        var slider = svg.append('g')
          .attr('class', 'p-value-slider')
          .attr('transform', 'translate(' + (width / 2 - 30) + ',50)')
          .call(sliderAxis);

      
        var drag = d3.behavior.drag()
          .on('drag', function(d){
            var circle = d3.select(this);
            var d = Number(circle.attr('d')) + sliderY.invert(d3.event.dy);
            if(d < sliderY.domain()[0] ) d = sliderY.domain()[0];
            if(d > sliderY.domain()[1]) d = sliderY.domain()[1];
            circle.attr('d', d);
            circle.attr('cy', function(){
              return sliderY(d);
            })
            redraw(Number(d3.select(this).attr('d')));
          })
          .on('dragend', function(){
          redraw(Number(d3.select(this).attr('d')));
            plotData1 = d3.range(50).map(function(){return 0;})
            plotData2 = d3.range(50).map(function(){return 0;})
            path1.data([plotData1])
            path2.data([plotData2])         
            brownData1 = d3.range(50).map(function(){return 0;})
            brownData2 = d3.range(50).map(function(){return 0;})
            bpath1.data([brownData1])
            bpath2.data([brownData2])
          });
      
        var sliderLabel = slider.append("text")
          .text("Kurtosis (fat-tailedness)")
          .attr({
            transform: "translate(-65," + 9 + ") rotate(0)",
            class: "sliderLabel"
          })
          .style("font" ,"15px")

        var dragger = slider.append('circle')
          .attr('class', 'handle')
          .attr('r', 7)
          .attr('d', (sliderY.domain()[0] + sliderY.domain()[1]) / 2)
          .attr('cy', function(){
            return sliderY(Number(d3.select(this).attr('d')))
          }).call(drag);
      })();