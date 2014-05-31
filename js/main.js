angular.module('floodforecast', []).
  
  controller('AppCtrl', function($scope,$http,$q,$sce) {

  $scope.map;
  //Boulder
  $scope.location = [-105.2797, 40.0176];
  $scope.badHouses = [];

  require(["esri/symbols/SimpleMarkerSymbol", "dojo/_base/array", "dojo/string", "esri/tasks/QueryTask", "esri/tasks/query", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "dojo/domReady!"], 
   function(SimpleMarkerSymbol, array, dojoString, QueryTask, Query, Map, ArcGISDynamicMapServiceLayer, FeatureLayer) { 
    $scope.map = new Map("map", {
      center: $scope.location,
      zoom: 13,
      basemap: "streets"
    });

    $scope.flood = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/ArcGIS/rest/services/Dissolve%20Boulder%20floodplain/FeatureServer/0");
    $scope.houses = new FeatureLayer("http://services2.arcgis.com/XrTRbkeSS1aM6EfD/arcgis/rest/services/floody_houses/FeatureServer/0");
    $scope.houses.setSelectionSymbol(new SimpleMarkerSymbol({
      "color": [255,128,128,128],
      "size": 12,
      "style": "esriSMSCircle"
    }));

    $scope.map.addLayers([$scope.flood,$scope.houses]);

    // once both layers are loaded
    $scope.map.on("layers-add-result", function() {
      
      // get the polygon feature
      $scope.query1 = new Query();
      $scope.query1.where = "1=1";
      $scope.flood.queryFeatures($scope.query1, function(results){
          
          // get geometry of polygon feature
          $scope.query2 = new Query();
          $scope.query2.geometry = results.features[0].geometry; 
          
          // select only houses that are inside polygon geometry
          $scope.houses.selectFeatures($scope.query2, FeatureLayer.SELECTION_NEW, function(results){
              // returning FID for matching items
              $scope.badHouses = results;
              console.log(results);
          });
      });
      if ( $scope.houses.hasOwnProperty("fields") ) {
        console.log("got some fields");
        
        var fieldInfo, pad;
          pad = dojoString.pad;

        fieldInfo = array.map($scope.houses.fields, function(f) {
          return pad("Field:", 8, " ", true) + pad(f.name, 25, " ", true) + 
            pad("Alias:", 8, " ", true) + pad(f.alias, 25, " ", true) + 
            pad("Type:", 8, " ", true) + pad(f.type, 25, " ", true);
        });
        console.log(fieldInfo.join("\n"));
      }
    });



  });

  function getForecast(){
    
      $http.jsonp('https://api.forecast.io/forecast/e9c963d9b9cecdf941a11d1c2c46f4e5/'+$scope.location[1]+','+$scope.location[0]+'?callback=JSON_CALLBACK',{timeout: 10000}).then(function(response){

          figureForecast( response.data ); 
                  
      });        
  }

  function figureForecast(data){
    console.log(data);
  }

  //Get Forecast from Forecast.io
  // getForecast();

});