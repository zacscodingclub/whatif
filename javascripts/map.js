var mapMain;

// @formatter:off
require([
        "esri/map",
		"esri/layers/FeatureLayer",
        "esri/graphic",
		"esri/dijit/Search",
        "esri/tasks/locator",
		"esri/tasks/query",
		"esri/geometry/geometryEngine","esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
		"esri/graphic",
		"esri/dijit/FeatureTable",
		"esri/tasks/StatisticDefinition",

        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",

        "dojo/_base/Color",
        "dojo/_base/array",

        "dojo/dom",
        "dojo/on",
        "dojo/parser",
        "dojo/ready",
		"dojo/_base/declare",

        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
		"dgrid/OnDemandGrid",
		"dojo/store/Memory",
  "dgrid/Selection"],
    function (Map,featLayer, Graphic,Search,Locator,query,geomeng,SimpleFillSymbol, SimpleLineSymbol, aColor,graphic,ft,statDef,
              SimpleMarkerSymbol, TextSymbol, Font,
              Color, array,
              dom, on, parser, ready,declare,
              BorderContainer, ContentPane,Grid,Memory, Selection) {
// @formatter:on

        // Wait until DOM is ready *and* all outstanding require() calls have been resolved
        ready(function () {

            var taskLocator;

            // Parse DOM nodes decorated with the data-dojo-type attribute
            parser.parse();

            // Create the map
            mapMain = new Map("map", {
                basemap: "satellite",
                center: [-117.157, 32.707],
                zoom: 18
            });

			
			// Initialize the dgrid
    var gridQuakes = new (declare([Grid, Selection]))({
      bufferRows : Infinity,
      loadingMessage:"Lodaing data ...",
      noDataMessage:"No data rec",
      columns : {
        description : "description",
        
        start_speed : "start_speed",
        end_speed : "end_speed",
        pfx_z : "pfx_z",
		 pfx_x : "pfx_x"
      }
    }, "table2");
			
	gridQuakes.on(".dgrid-row:click",function(evt){
		console.log(evt);
		var row = gridQuakes.row(evt);
		console.log(row);
		row.element.style.backgroundColor = "#27ae60";
	});
			
			
			
			
			
			
			
			
			
			
			
			var padreHits = new featLayer("http://services.arcgis.com/XWaQZrOGjgrsZ6Cu/arcgis/rest/services/Padres_events/FeatureServer/0",
			{outFields:["description","start_speed","end_speed","pfx_z","pfx_x"]});
			
			mapMain.addLayer(padreHits);
			
			
			
	
	
		
				
		//end feat coll
			
			
			
			
			
			
			
			padreHits.on("load",function(){
				
				console.log("load")
			})
			
			
			mapMain.on("click",function(evt){
				gridQuakes.set("store", "");
				var clickSpt = evt.mapPoint
				var buffPoly = geomeng.buffer(clickSpt,10)
				console.log(buffPoly);
				
				
				var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
    new Color([255,0,0]), 2),new aColor([255,255,0,0.25])
  );
				var buff = new graphic(buffPoly,sfs)
				mapMain.graphics.add(buff);
				
				//Statsdef
				var stats = new statDef()
				stats.onStatisticField = "description"
				stats.outStatisticFieldName = "Freq"
				stats.statisticType = "count"
				
				//Build and apply the query
				var qparams = new query();
				qparams.geometry = buffPoly
				//qparams.outStatistics = [stats]
				padreHits.queryFeatures(qparams,processQuery);
				
			});
			
            /*
             * Step: Add the Search widget
             */
             var dijitSearch = new Search({
                map: mapMain,
                enableButtonMode: true,
                enableLabel: false,
                enableInfoWindow: true
            }, "divSearch");
            dijitSearch.startup();
 
			function processQuery(res){
				
				console.log(res);
				
				
				
				
				
				var gridData;

      dataQuakes = array.map(res.features, function(feature) {
        return {
          /*
           * Step: Reference the attribute field values
           */
          "description" : feature.attributes["description"],
          "start_speed" : feature.attributes["start_speed"],
          "end_speed" : feature.attributes["end_speed"],
          "pfx_z" : feature.attributes["pfx_z"],
          "pfx_x" : feature.attributes["pfx_x"]

        }
      });

	  //outFieldsQuakes[1]
	  
	  
      // Pass the data to the grid
      var memStore = new Memory({
        data : dataQuakes
      });
      gridQuakes.set("store", memStore);
    }
				
				
			
				
			
            
			

            

            function showResults(candidates) {
                // Define the symbology used to display the results
                var symbolMarker = new SimpleMarkerSymbol();
                symbolMarker.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
                symbolMarker.setColor(new Color([255, 0, 0, 0.75]));
                var font = new Font("14pt", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, "Helvetica");

                // loop through the array of AddressCandidate objects
                var geometryLocation;
                array.every(candidates.addresses, function (candidate) {

                    // if the candidate was a good match
                    if (candidate.score > 80) {

                        // retrieve attribute info from the candidate
                        var attributesCandidate = {
                            address: candidate.address,
                            score: candidate.score,
                            locatorName: candidate.attributes.Loc_name
                        };

                        /*
                         * Step: Retrieve the result's geometry
                         */
                        geometryLocation = candidate.location;

                        /*
                         * Step: Display the geocoded location on the map
                         */
                        var graphicResult = new Graphic(geometryLocation, symbolMarker, attributesCandidate);
                        mapMain.graphics.add(graphicResult);

                        // display the candidate's address as text
                        var sAddress = candidate.address;
                        var textSymbol = new TextSymbol(sAddress, font, new Color("#FF0000"));
                        textSymbol.setOffset(0, -22);
                        mapMain.graphics.add(new Graphic(geometryLocation, textSymbol));

                        // exit the loop after displaying the first good match
                        return false;
                    }
                });

                // Center and zoom the map on the result
                if (geometryLocation !== undefined) {
                    mapMain.centerAndZoom(geometryLocation, 15);
                }
            }

        });

    });
