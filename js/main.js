angular.module('floodforecast', []).
  
  controller('AppCtrl', function($scope,$http,$q,$sce) {

  $scope.map;
  $scope.location = [-104.9847, 39.7392];

  require(["esri/map", "dojo/domReady!"], function(Map) { 
    $scope.map = new Map("map", {
      center: $scope.location,
      zoom: 13,
      basemap: "streets"
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