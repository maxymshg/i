//angular.module('app').factory('BankIDService', function ($http, $q, AdminService, ErrorsFactory) {
angular.module('order').controller('OrderSearchController', function($rootScope, $scope,$location,$window,$state, $stateParams, ServiceService, MessagesService,BankIDService, order, $http, ErrorsFactory) {

    $scope.aOrderMessage = [];
    $scope.sServerReturnOnAnswer= '';
    $scope.asServerReturnOnRequest = [];
    
    $scope.sID_Order = '';
    $scope.sToken = null;
    $scope.oOrder = {};
    $scope.aField = [];
    $scope.sOrderCommentNew = '';
    $scope.sOrderAnswerCommentNew = '';
    
    $scope.bAuthenticated = false;
    $scope.bOrder = false;
    $scope.bOrderOwner = false;
    $scope.bOrderQuestion = false;

    var asErrorMessages = function(asMessageDefault, oData, onCheckMessage){
        /*var oData = {"s":"asasas"};
        $.extend(oData,{sDTat:"dddddd"});
        var a=[];
        a=a.concat(["1"]);*/ //{"code":"SYSTEM_ERR","message":null}
        if(!asMessageDefault || asMessageDefault===null){
            asMessageDefault=[];
        }
        var asMessage = [];
        try{
            if (!oData) {
                asMessage=asMessage.concat(['Пуста відповідь на запит!']);
            }else{
                var nError=0;
                if (oData.hasOwnProperty('message')) {
                    if(onCheckMessage!==null){
                        var asMessageNew = onCheckMessage(oData.message);
                        if(asMessageNew!==null){
                            asMessage=asMessage.concat(asMessageNew);
                        }else{
                            asMessage=asMessage.concat(['Message: '+oData.message]);
                        }
                    }else{
                        asMessage=asMessage.concat(['Message: '+oData.message]);
                    }
                    oData.message=null;
                    nError++;
                }
                if (oData.hasOwnProperty('code')) {
                    asMessage=asMessage.concat(['Code: '+oData.code]);
                    oData.code=null;
                    nError++;
                }
                if(nError>0){
                    asMessage=asMessage.concat(['oData: '+oData]);
                }
            }
        }catch(sError){
            asMessage=asMessage.concat(['Невідома помилка!','oData: '+oData,'sError: '+sError]);
        }
        if(asMessage.length>0){
            asMessage=asMessageDefault.concat(asMessage);
            console.error('[asErrorMessages]:asMessage='+asMessage);
        }
        return asMessage;
    };
   
    var bExist = function(oValue){
        return oValue && oValue !== null && oValue !== undefined && !!oValue;
    };
    
    var bExistNotSpace = function(oValue){
        return bExist(oValue) && oValue.trim()!=="";
    };
   
   
/*   
  $scope.htmldecode = function(encodedhtml)
  {
    var map = {
      '&amp;'     :   '&',
      '&gt;'      :   '>',
      '&lt;'      :   '<',
      '&quot;'    :   '"',
      '&#39;'     :   "'"
    };

    var result = angular.copy(encodedhtml);
    angular.forEach(map, function(value, key)
    {
      while(result.indexOf(key) > -1)
        result = result.replace(key, value);
    });

    return result;
  };

  $scope.getHtml = function(html) {
    return $sce.trustAsHtml(html);
  };
*/
    
    
    
    if(order !== null) {
       $scope.searchOrder(
               bExist($stateParams.sID_Order) ? $stateParams.sID_Order : bExist($stateParams.nID) ? "0-" + $stateParams.nID : $scope.sID_Order
               , bExist($stateParams.sToken) ? $stateParams.sToken : $scope.sToken
            );
    }

    $scope.searchOrder = function(sID_Order_New, sToken_New) {
        var sID_Order = bExist(sID_Order_New) ? sID_Order_New : $scope.sID_Order;
        var sToken = bExist(sToken_New) ? sToken_New : $scope.sToken;
        $scope.sID_Order = sID_Order;
        $scope.sToken = sToken;
        var oOrder = {};
        $scope.aField = [];
        $scope.oOrder = oOrder;
        $scope.bOrder = false;
        $scope.bOrderOwner = false;
        $scope.bOrderQuestion = false;
        $scope.sServerReturnOnAnswer = '';
        $scope.asServerReturnOnRequest = [];
        if(bExistNotSpace(sID_Order)){
            ServiceService.searchOrder(sID_Order, sToken)
                .then(function(oData) {
                    $scope.asServerReturnOnRequest = asErrorMessages(["Помилка при отримані заявки!", 'Function: searchOrder'],oData,function(sErrorMessage){
                        if (sErrorMessage && sErrorMessage !== null && sErrorMessage.indexOf('CRC Error') > -1) {
                            return ['Невірний номер!','sID_Order: '+sID_Order];
                        } else if (sErrorMessage && sErrorMessage !== null && sErrorMessage.indexOf('Record not found') > -1) {
                            return ['Заявку не знайдено!','sID_Order: '+sID_Order];
                        } else {
                            return ['Невідома помилка!','sErrorMessage: '+sErrorMessage,'sID_Order: '+sID_Order];
                        }                    
                    });
                    /*
                    sID: item.id,
                    sName: item.name,
                    sType: item.type,
                    sValue: item.value,
                    sValueNew: "",
                    sNotify: $scope.clarifyFields[item.id].text
                    */
                    if($scope.asServerReturnOnRequest.length===0){
                        if (typeof oData === 'object') {
                            if (oData.soData){
                                try{
                                    var aField = JSON.parse(oData.soData.replace(/'/g,'"'));
                                    angular.forEach(aField, function(oField){
                                        if(!bExist(oField.sID)){
                                            oField.sID=oField.id;
                                            oField.sName=oField.id;
                                            oField.sType=oField.type;
                                            oField.sValue=oField.value;
                                            oField.sValueNew=oField.value;
                                            oField.sNotify=oField.value;
                                            oField.id="";
                                            oField.type="";
                                            oField.value="";
                                        }
                                    });
                                    $scope.aField = aField;
                                }catch(sError){
                                  $scope.asServerReturnOnRequest=['Помилка десереалізації об`єкту з полями, у яких зауваження при отримані заявки!', 'Function: searchOrder','sError: '+sError, 'sID_Order: '+sID_Order,'sToken: '+sToken,'oData.soData: '+oData.soData];
                                }
                            }
                            oOrder = oData;
                        }else{
                            $scope.asServerReturnOnRequest=['Помилка - повернено не об`єкт при отримані заявки!', 'Function: searchOrder', 'sID_Order: '+sID_Order,'sToken: '+sToken,'oData.soData: '+oData.soData];
                        }
                    }
                    if($scope.asServerReturnOnRequest.length>0){
                        console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
                        var s=$scope.asServerReturnOnRequest;
                        $scope.asServerReturnOnRequest=[];
                        ErrorsFactory.push({type: "danger", text: s});
                    }else{
                        $scope.oOrder = oOrder;
                        $scope.bOrder = bExist(oOrder) && bExist(oOrder.nID);
                        $scope.bOrderOwner = $scope.bOrder && bExist(oOrder.nID_Subject) && oOrder.nID_Subject === oOrder.nID_Subject_Auth;
                        $scope.bOrderQuestion = $scope.bOrder && $scope.aField.length > 0;
                        $scope.loadMessages($scope.sID_Order, $scope.sToken);
                    }
                    return oOrder;
                }, function (sError){
                  $scope.asServerReturnOnRequest=['Невідома помилка при пошуку заявки!', 'Function: searchOrder','sError: '+sError, 'sID_Order: '+sID_Order,'sToken: '+sToken,'$scope.oOrder: '+$scope.oOrder];
                  console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
                    var s=$scope.asServerReturnOnRequest;
                    $scope.asServerReturnOnRequest=[];
                    ErrorsFactory.push({type: "danger", text: s});
                });            
        }else{
            console.log(['Не задані параметри при пошуку заявки!', 'Function: searchOrder','sID_Order: '+sID_Order,'sToken: '+sToken]);
        }
    };
    
    $scope.loadMessages = function(sID_Order, sToken){
        $scope.asServerReturnOnRequest = [];
        $scope.aOrderMessage = [];
        BankIDService.isLoggedIn().then(function() {
            $scope.bAuthenticated = true;
            if ($scope.bOrderOwner){
                MessagesService.getServiceMessages(sID_Order, sToken).then(function(oData){
                  $scope.asServerReturnOnRequest = asErrorMessages(["Помилка при отримані коментарів", 'Function: loadMessages'],oData);
                  if($scope.asServerReturnOnRequest.length===0){
                      if(bExist(oData.messages)){
                          $scope.aOrderMessage = oData.messages;
                      }else{
                          $scope.asServerReturnOnRequest=['Невідома помилка при отримані коментарів!', 'Function: loadMessages','oData: '+oData,'sID_Order: '+sID_Order,'sToken: '+sToken];
                      }
                  }
                }, function (sError){
                  $scope.asServerReturnOnRequest=['Невідома помилка при отримані коментарів!', 'Function: loadMessages','sError: '+sError,'sID_Order: '+sID_Order,'sToken: '+sToken];
                });
            }else{
                console.log(['Заборонено отримувати чужу історию або без авторизації!!', 'Function: loadMessages','sID_Order: '+sID_Order,'sToken: '+sToken,'bOrderOwner: '+$scope.bOrderOwner]);
            }
            if($scope.asServerReturnOnRequest.length>0){
                console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
                var s=$scope.asServerReturnOnRequest;
                $scope.asServerReturnOnRequest=[];
                ErrorsFactory.push({type: "danger", text: s});
            }        
        }).catch(function(sError) {
            $scope.bAuthenticated = false;
            $scope.asServerReturnOnRequest=['Невідома помилка при отримані коментарів!', 'Function: loadMessages','sError: '+sError,'sID_Order: '+sID_Order,'sToken: '+sToken];
            console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
            var s=$scope.asServerReturnOnRequest;
            $scope.asServerReturnOnRequest=[];
            ErrorsFactory.push({type: "danger", text: s});
        });            
  } ;

  $scope.postComment = function(){
    if (bExistNotSpace($scope.sOrderCommentNew)){
        $scope.asServerReturnOnRequest = [];
        var sID_Order = $scope.sID_Order;
        var sToken = $scope.sToken;
        if($scope.bOrderOwner){
            if(bExistNotSpace(sID_Order)){
              try{
                MessagesService.postServiceMessage(sID_Order, $scope.sOrderCommentNew, sToken);//$scope.orders[0].sID_Order
                $scope.sOrderCommentNew = "";
                $scope.loadMessages(sID_Order, sToken);
              }catch(sError){
                $scope.asServerReturnOnRequest=['Невідома помилка при підправці коментаря!', 'Function: postComment','sError: '+sError,'sID_Order: '+sID_Order,'sToken: '+sToken,'sOrderCommentNew: '+$scope.sOrderCommentNew];
              }
            }else{
              $scope.asServerReturnOnRequest=['Не задані параметри при підправці коментаря!', 'Function: postComment','sID_Order: '+sID_Order,'sToken: '+sToken,'sOrderCommentNew: ',$scope.sOrderCommentNew];
            }
        }else{
            $scope.asServerReturnOnRequest=['Немає доступу!', 'Function: postComment', 'sID_Order: '+sID_Order,'sToken: '+sToken,'bOrderOwner: '+$scope.bOrderOwner];
        }
        if($scope.asServerReturnOnRequest.length>0){
            console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
            var s=$scope.asServerReturnOnRequest;
            $scope.asServerReturnOnRequest=[];
            ErrorsFactory.push({type: "danger", text: s});
        }
    }else{
        console.log(['Пустій коментар!', 'Function: postComment', 'sID_Order: '+sID_Order,'sToken: '+sToken]);
    }
  };

  $scope.sendAnswer = function () {
    $scope.asServerReturnOnRequest = [];
    var sID_Order = $scope.sID_Order;
    var sToken = $scope.sToken;
    var oOrder = bExist($scope.oOrder) && bExist($scope.oOrder.nID) ? $scope.oOrder : null;
    if($scope.bOrderOwner){
        if(bExistNotSpace(sID_Order) && bExist(oOrder)){
            try{
                var oData = {
                  sID_Order: sID_Order,
                  sBody: $scope.sOrderAnswerCommentNew
                };
                if(sToken!==null){
                    oData = $.extend(oData,{sToken: sToken});
                }
                
                if ($scope.aField){//oOrder.soData
                    try{
                        oData.saField = JSON.stringify($scope.aField);//oOrder.soData
                    }catch(sError){
                        $scope.asServerReturnOnRequest=['Помилка сереалізації об`єкту з полями, у яких відповіді на зауваження при отримані заявки!', 'Function: sendAnswer','sError: '+sError, 'sID_Order: '+sID_Order,'sToken: '+sToken,'oData.soData: '+oData.soData];
                    }
                }
                $http.post('/api/order/setTaskAnswer', oData).success(function() {
                  $scope.sOrderAnswerCommentNew = "";
                  $scope.sServerReturnOnAnswer = 'Ваша відповідь успішно збережена';
                  //$scope.loadMessages(sID_Order, sToken);
                });
              }catch(sError){
                $scope.asServerReturnOnRequest=['Невідома помилка при відсилці відповіді!', 'Function: sendAnswer','sError: '+sError, 'sID_Order: '+sID_Order,'sToken: '+sToken,'oOrder: '+oOrder];
              }
        }else{
          $scope.asServerReturnOnRequest=['Не задані параметри для запиту при відсилці відповіді!', 'Function: sendAnswer', 'sID_Order: '+sID_Order,'sToken: '+sToken,'oOrder: '+oOrder];
        }
    }else{
        $scope.asServerReturnOnRequest=['Немає доступу!', 'Function: sendAnswer', 'sID_Order: '+sID_Order,'sToken: '+sToken,'bOrderOwner: '+$scope.bOrderOwner];
    }
    if($scope.asServerReturnOnRequest.length>0){
        console.error("asServerReturnOnRequest="+$scope.asServerReturnOnRequest);
        var s=$scope.asServerReturnOnRequest;
        $scope.asServerReturnOnRequest=[];
        ErrorsFactory.push({type: "danger", text: s});
    }
  };






  $scope.loginWithBankId = function () {
    var stateForRedirect = $state.href('index.order.search', {error: ''}) + "?sID_Order="+$scope.sID_Order;
    var redirectURI = $location.protocol() +
      '://' + $location.host() + ':'
      + $location.port()
      + stateForRedirect;
    $window.location.href = './auth/bankID?link=' + redirectURI;
  };

  $scope.loginWithEds = function () {
    var stateForRedirect = $state.href('index.order.search', {error: ''}) + "?sID_Order="+$scope.sID_Order;
    var redirectURI = $location.protocol() +
      '://' + $location.host() + ':'
      + $location.port()
      + stateForRedirect;
    $window.location.href = './auth/eds?link=' + redirectURI;
  };

    $scope.loginWithEmail = function () {
        $state.go('index.auth.email.verify');
    };

  $scope.loginWithSoccard = function () {
    var stateForRedirect = $state.href('index.order.search', {error: ''}) + "?sID_Order="+$scope.sID_Order;
    var redirectURI = $location.protocol() +
      '://' + $location.host() + ':'
      + $location.port()
      + stateForRedirect;
    $window.location.href = './auth/soccard?link=' + redirectURI;
  };
});
