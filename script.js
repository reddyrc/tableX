var app = angular.module('tableDirectiveModule', []);
app.controller('controller', ['$scope', function($scope) {
  $scope.name = 'Tobias';
  $scope.values = [];
  var item = {id: 232, age: 12, height: 56, name: 'red', weight: 135};
  item.history = [];
  item.history.push({id: 2, age: 11, height: 22, name: 'red', weight: 135});
  item.history.push({id: 1, age: 10, height: 33, name: 'red', weight: 152});
  $scope.values.push(item);
  item = {id:123, age: 12, height: 56, name: 'green', weight: 135};
  item.history = [];
  item.history.push({id:3, age: 12, height: 56, name: 'green', weight: 111});
  item.history.push({id:2, age: 13, height: 23, name: 'green', weight: 123});
  item.history.push({id:1, age: 14, height: 65, name: 'green', weight: 135});
  $scope.values.push(item);
  item = {id: 392, age: 12, height: 56, name: 'green', weight: 231};
  item.history = [];
  item.history.push({id: 1, age: 54, height: 56, name: 'green', weight: 121});
  $scope.values.push(item);
  item = {id: 393, age: 12, height: 52, name: 'black', weight: 123};
  $scope.values.push(item);
  $scope.edit = function(x) {
    console.log("id: " + x.id);
  }
}]);


app.directive('histTable', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'tableTemplate.html',
        replace: false,
        priority: 0,
        scope: {
            records: "=values"
        },
    // compile: function compile(tElement, tAttrs, tTransclude) {
    //
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, crtl, transclude) {
    //         console.log("calling pre");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("calling post");
    //     }
    //   };
    // },
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            $scope.headers = [];
      $scope.element = $element;
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
      $scope.call = function(functionName, arg) {
        $element.scope().$eval(functionName)(arg);
      }

            $scope.getHistoryValue = function(history, header) {
                return history[header.historyField];
            }
      $scope.toggleHistory = function($item) {
        if ( $item.showChildren == undefined ) {
          $item.showChildren = true;
          return;
        }
        $item.showChildren = !$item.showChildren;
      }
      $scope.processKey = function($event, $item) {
        if ( $event.keyCode == 13 ) {
          $scope.toggleHistory($item);
          var id = $event.currentTarget.id;
          if (id.indexOf("minus") != -1) {
            id = id.replace(/minus/g, "plus");
            $("#"+id).focus();
          }
          else {
            id = id.replace(/plus/g, "minus");
            $("#"+id).focus();
          }
          console.log("id: " + id);
        }
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
        require: '^^histTable',
        priority: 10,
        link: function(scope, element, attrs, tableCtrl) {
            tableCtrl.addHeader(attrs.name, attrs.historyfield);
        }
    }
});

app.directive('historyToggle', function($templateCache) {
  return {
    restrict: 'E',
    require: '^^histTable',
    template: $templateCache.get("historyToggleColumn.html"),
    link: function(scope, element, attrs, tableCtrl) {
      ;
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
