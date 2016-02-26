var app = angular.module('tableDirectiveModule', []);
app.controller('controller', ['$scope', function($scope) {
  $scope.name = 'Tobias';
  $scope.values = [];
  var item = {id: 232, age: 12, height: 56, name: 'red', weight: 135};
  item.history = [];
  item.history.push({id: 231, age: 12, height: 56, name: 'red', weight: 135});
  $scope.values.push(item);
  item = {id:123, age: 12, height: 56, name: 'green', weight: 135};
  item.history = [];
  item.history.push({id:122, age: 12, height: 56, name: 'green', weight: 135});
  $scope.values.push(item);
  item = {id: 392, age: 12, height: 56, name: 'green', weight: 135};
  item.history = [];
  item.history.push({id: 391, age: 12, height: 56, name: 'green', weight: 135});
  $scope.values.push(item);
  
}]);


app.directive('testtable', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: 'tableTemplate.html',	
		replace: false,
		priority: 0,
		scope: {
			records: "=values"
		},
    compile: function compile(tElement, tAttrs, tTransclude) {      

      return {
        pre: function preLink(scope, iElement, iAttrs, crtl, transclude) {
            console.log("calling pre");
        },
        post: function postLink(scope, iElement, iAttrs, controller) {
          			console.log($("td"));
          console.log("calling post");
        }
      };
    },
		controller: ['$scope', function($scope, element, attrs) {
			$scope.headers = [];
			
			this.addHeader = function(headerName, historyField) {
			  var headerObj = {};
			  headerObj.headerName = headerName;
			  headerObj.historyField = historyField;
			  $scope.headers = jQuery.grep($scope.headers, function(item) {
			    if ( item.headerName != headerName) {
			      return true;
			    }
			  });
			$scope.headers.push(headerObj); 
			}
			
			this.getHeaders = function() {
				return $scope.headers;
			}
			
			$scope.getValue = function(history, header) {
				console.log(header);
				return history[header.historyField];
			}
			
		}],
	}
});

app.directive('column', function() {
	return {
		restrict: 'E', 
		transclude: true,
		template: '<td ng-transclude> </td>',
		replace: true,
		require: '^^testtable',
		priority: 10,
		link: function(scope, element, attrs, tableCtrl) { 
			tableCtrl.addHeader(attrs.name, attrs.historyfield);
		} 
	}
});

app.directive('displayhistoryrow', function($compile, $templateCache) {
	return {
		restrict: 'E', 
		transclude: false,
		template: '<div ng-include="\'historyview.html\'"</div>',
		replace: true,
		require: '^^testtable',
		scope: {
			item: "=history"
		},
		priority: -1,
		link: function(scope, element, attrs, tableCtrl) { 
			angular.element(document).ready(function() {
				var historyHtml = "";
				var headers = tableCtrl.getHeaders();
				for ( var x = 0; x < headers.length; x++) {
					historyHtml += "<td>{{item." + headers[0].historyField + "}}</td>";
				}
				$templateCache.put('historyview.html', historyHtml);
				
			});
		} 
	}
});

app.directive('inject', function(){
  return {
    link: function($scope, $element, $attrs, controller, $transclude) {
      if (!$transclude) {
        throw minErr('ngTransclude')('orphan',
         'Illegal use of ngTransclude directive in the template! ' +
         'No parent directive that requires a transclusion found. ' +
         'Element: {0}',
         startingTag($element));
      }
      var innerScope = $scope.$new();
      $transclude(innerScope, function(clone) {
        $element.empty();
        $element.append(clone);
        $element.on('$destroy', function() {
          innerScope.$destroy();
        });
      });
    }
  };
});