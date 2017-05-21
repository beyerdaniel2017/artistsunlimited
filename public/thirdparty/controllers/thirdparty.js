app.config(function($stateProvider) {
  $stateProvider.state('thirdparty', {
    url: '/admin/thirdparty',
    templateUrl: 'js/thirdparty/views/thirdparty.html',
    controller: 'thirdpartyController'
  })
});

app.controller('thirdpartyController', function($rootScope, $state, $scope, $http, AuthService, SessionService, thirdpartyservice, $sce, $window) {
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  SessionService.removeAccountusers(); 
  $scope.accountuser = SessionService.getUser();
  $scope.accountuser.paidRepost.groups = $scope.accountuser.paidRepost.groups ? $scope.accountuser.paidRepost.groups : [];

  //add account prepare part

  $scope.addGroup = function(index, item) {
    $scope.accountuser.paidRepost[index].groups.push('');
  }
  
  $scope.updateGroup = function(account) {
    var priceFlag = true;
    for (var i = $scope.accountuser.paidRepost.length - 1; i >= 0; i--) {
      if ($scope.accountuser.paidRepost[i].price) {
        priceFlag = true;
      } else {
        priceFlag = false;
        break;
      }
    }
    if (!priceFlag) {
      return $.Zebra_Dialog('Price can not be empty.');
    }
    $scope.processing = true;
    $http.post('/api/database/updateGroup', {
      paidRepost: $scope.accountuser.paidRepost,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.accountuser = SessionService.getUser();
    });
  }


  $scope.updatePaidRepostGroup = function(item, group) {
    console.log($scope.accountuser.paidRepost.length + " length");
    for (var i = 0; i < $scope.accountuser.paidRepost.length; i++) {
      if ($scope.accountuser.paidRepost[i].id == item.id) {
        $scope.accountuser.paidRepost[i].groups.push(group);
      }
    }
  }

  //getting scheduler access account
  $scope.getPaidRepostAccounts = function() {
    $http.get('/api/thirdpartyuser/getPaidRepostAccounts').then(function(res) {
      res.data = res.data.sort(function(a, b) {
        return a.user.id - b.user.id;
      });
      $scope.accountuser.paidRepost = res.data;      
    });
  }

  $scope.getPaidRepostAccounts();
  
  //create account_domodal 
  $scope.Adduser_domodal = function() {
    $scope.showTestEmailModal = true;
    $('#AddUser').modal('show');
  }

  var refresh = function(){
    //getting added subadmin account
    $http.get('/api/thirdpartyuser').then(function(response){
      $scope.Userlist = response.data;
      console.log(response.data);
    });
    
  }
  refresh();

  //getting submission account 
  $scope.submissionaccountlisteven = [];
  $scope.submissionaccountlistadd = [];
  $http.get('/api/thirdpartyuser/getsubmissionAccounts').then(function(res) {
    var evenindex=0;
    var addindex = 0;
    for (var i = 0; i < res.data.length; i++) {
      if ((i%2)== 0) {
        $scope.submissionaccountlisteven[evenindex]=res.data[i];
        evenindex ++;
      } else{
        $scope.submissionaccountlistadd[addindex]=res.data[i];
        addindex ++;
      };
    };
  });

  //Create subadminaccount part
  $scope.Createuser = function(email, password) {
    if (email=="" || password=="") {
    };
    var accountemail = $scope.accountuser.email;
    console.log(accountemail + "accountemail rascal");
		$http.post('/api/thirdpartyuser', {
        accountemail: accountemail,
        email: email,
        password: password
      }).then(function(res) {
      console.log("rascal res");
      //console.log(les);
    });    
    refresh();
  }

 //add user close
  $scope.closeModal = function() {
    $('#AddUser').modal('hide');
  }


  //add selected user part  
  $scope.adduser = function(id) {
    //i++;
    $http.get('/api/thirdpartyuser/adduser/' + id)
    .then(function(response) {
      $scope.adduser = response.data;
    });
    
  }

  //delete selected user part 
  $scope.deleteuser = function() {
    var email= $scope.adduser.email;
    console.log(email + "rascal email");
    $http.delete('/api/thirdpartyuser/' + email)
    .then(function(response){
      console.log("delete rascal");
      $scope.adduser=response.data;
      console.log(response + "rascal delete success");
        refresh();
      });
  }
  //complete----------------------------------------
 
  //save subadmin account part 
  $scope.addaccount = [];
  $scope.addsubmissionusereven = [];
  $scope.addsubmissionuser = []; 
 
  $scope.save = function() {
    var subaccountlength = 0;
    var scheduleraccountlength = 0;
    var scheduleraccount = [];
    var submissionaccountlist = [];
    var submissionaccount = [];
    var subname = [];
    var subemail = [];
    console.log($scope.addaccount.length + " $scope.addaccount.length");
    for (var i = $scope.addaccount.length; i > 0; i--) {
      if ($scope.addaccount[i]) {
        console.log(i + " i");
        scheduleraccount[scheduleraccountlength]=JSON.parse($scope.addaccount[i]);
        scheduleraccountlength++;
      };     
    };

    for (var j = 0; j < $scope.addsubmissionusereven.length; j++) {
      if ($scope.addsubmissionusereven[j]) {
        console.log(j + " j");
        submissionaccountlist[subaccountlength]=JSON.parse($scope.addsubmissionusereven[j]);
        subname[subaccountlength] = submissionaccountlist[subaccountlength].name;
        subemail[subaccountlength] = submissionaccountlist[subaccountlength].email;
        subaccountlength++;
      };
    };
    
    console.log(subaccountlength + " subaccountlength");
    for (var l = 0; l < $scope.addsubmissionuser.length;  l++ ) {
      if ($scope.addsubmissionuser[l]) {
        submissionaccountlist[subaccountlength]=JSON.parse($scope.addsubmissionuser[l]);
        subname[subaccountlength] = submissionaccountlist[subaccountlength].name;
        subemail[subaccountlength] = submissionaccountlist[subaccountlength].email;
        subaccountlength++;
      };
    };
    submissionaccount[0] = subname;
    submissionaccount[1] = subemail;
    $http.post('/api/thirdpartyuser/saveaccount', {
        useremail: $scope.adduser.email,
        scheduleraccount : scheduleraccount,
        submissionaccount : submissionaccount
      }).then(function(res) {
      console.log("rascal res");
      });
  }
 
  

});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGlyZHBhcnR5L2NvbnRyb2xsZXJzL3RoaXJkcGFydHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGhpcmRwYXJ0eScsIHtcbiAgICB1cmw6ICcvYWRtaW4vdGhpcmRwYXJ0eScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy90aGlyZHBhcnR5L3ZpZXdzL3RoaXJkcGFydHkuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ3RoaXJkcGFydHlDb250cm9sbGVyJ1xuICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCd0aGlyZHBhcnR5Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCB0aGlyZHBhcnR5c2VydmljZSwgJHNjZSwgJHdpbmRvdykge1xuICAkc2NvcGUuaXNMb2dnZWRJbiA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSA/IHRydWUgOiBmYWxzZTtcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XG4gIH1cbiAgU2Vzc2lvblNlcnZpY2UucmVtb3ZlQWNjb3VudHVzZXJzKCk7IFxuICAkc2NvcGUuYWNjb3VudHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmdyb3VwcyA9ICRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmdyb3VwcyA/ICRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmdyb3VwcyA6IFtdO1xuXG4gIC8vYWRkIGFjY291bnQgcHJlcGFyZSBwYXJ0XG5cbiAgJHNjb3BlLmFkZEdyb3VwID0gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAkc2NvcGUuYWNjb3VudHVzZXIucGFpZFJlcG9zdFtpbmRleF0uZ3JvdXBzLnB1c2goJycpO1xuICB9XG4gIFxuICAkc2NvcGUudXBkYXRlR3JvdXAgPSBmdW5jdGlvbihhY2NvdW50KSB7XG4gICAgdmFyIHByaWNlRmxhZyA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9ICRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoJHNjb3BlLmFjY291bnR1c2VyLnBhaWRSZXBvc3RbaV0ucHJpY2UpIHtcbiAgICAgICAgcHJpY2VGbGFnID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByaWNlRmxhZyA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFwcmljZUZsYWcpIHtcbiAgICAgIHJldHVybiAkLlplYnJhX0RpYWxvZygnUHJpY2UgY2FuIG5vdCBiZSBlbXB0eS4nKTtcbiAgICB9XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlR3JvdXAnLCB7XG4gICAgICBwYWlkUmVwb3N0OiAkc2NvcGUuYWNjb3VudHVzZXIucGFpZFJlcG9zdCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XG4gICAgICAkc2NvcGUuYWNjb3VudHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgfSk7XG4gIH1cblxuXG4gICRzY29wZS51cGRhdGVQYWlkUmVwb3N0R3JvdXAgPSBmdW5jdGlvbihpdGVtLCBncm91cCkge1xuICAgIGNvbnNvbGUubG9nKCRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmxlbmd0aCArIFwiIGxlbmd0aFwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5hY2NvdW50dXNlci5wYWlkUmVwb3N0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoJHNjb3BlLmFjY291bnR1c2VyLnBhaWRSZXBvc3RbaV0uaWQgPT0gaXRlbS5pZCkge1xuICAgICAgICAkc2NvcGUuYWNjb3VudHVzZXIucGFpZFJlcG9zdFtpXS5ncm91cHMucHVzaChncm91cCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9nZXR0aW5nIHNjaGVkdWxlciBhY2Nlc3MgYWNjb3VudFxuICAkc2NvcGUuZ2V0UGFpZFJlcG9zdEFjY291bnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3RoaXJkcGFydHl1c2VyL2dldFBhaWRSZXBvc3RBY2NvdW50cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICByZXMuZGF0YSA9IHJlcy5kYXRhLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYS51c2VyLmlkIC0gYi51c2VyLmlkO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuYWNjb3VudHVzZXIucGFpZFJlcG9zdCA9IHJlcy5kYXRhOyAgICAgIFxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmdldFBhaWRSZXBvc3RBY2NvdW50cygpO1xuICBcbiAgLy9jcmVhdGUgYWNjb3VudF9kb21vZGFsIFxuICAkc2NvcGUuQWRkdXNlcl9kb21vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dUZXN0RW1haWxNb2RhbCA9IHRydWU7XG4gICAgJCgnI0FkZFVzZXInKS5tb2RhbCgnc2hvdycpO1xuICB9XG5cbiAgdmFyIHJlZnJlc2ggPSBmdW5jdGlvbigpe1xuICAgIC8vZ2V0dGluZyBhZGRlZCBzdWJhZG1pbiBhY2NvdW50XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3RoaXJkcGFydHl1c2VyJykudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAkc2NvcGUuVXNlcmxpc3QgPSByZXNwb25zZS5kYXRhO1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG4gICAgfSk7XG4gICAgXG4gIH1cbiAgcmVmcmVzaCgpO1xuXG4gIC8vZ2V0dGluZyBzdWJtaXNzaW9uIGFjY291bnQgXG4gICRzY29wZS5zdWJtaXNzaW9uYWNjb3VudGxpc3RldmVuID0gW107XG4gICRzY29wZS5zdWJtaXNzaW9uYWNjb3VudGxpc3RhZGQgPSBbXTtcbiAgJGh0dHAuZ2V0KCcvYXBpL3RoaXJkcGFydHl1c2VyL2dldHN1Ym1pc3Npb25BY2NvdW50cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgdmFyIGV2ZW5pbmRleD0wO1xuICAgIHZhciBhZGRpbmRleCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKChpJTIpPT0gMCkge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbmFjY291bnRsaXN0ZXZlbltldmVuaW5kZXhdPXJlcy5kYXRhW2ldO1xuICAgICAgICBldmVuaW5kZXggKys7XG4gICAgICB9IGVsc2V7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uYWNjb3VudGxpc3RhZGRbYWRkaW5kZXhdPXJlcy5kYXRhW2ldO1xuICAgICAgICBhZGRpbmRleCArKztcbiAgICAgIH07XG4gICAgfTtcbiAgfSk7XG5cbiAgLy9DcmVhdGUgc3ViYWRtaW5hY2NvdW50IHBhcnRcbiAgJHNjb3BlLkNyZWF0ZXVzZXIgPSBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICBpZiAoZW1haWw9PVwiXCIgfHwgcGFzc3dvcmQ9PVwiXCIpIHtcbiAgICB9O1xuICAgIHZhciBhY2NvdW50ZW1haWwgPSAkc2NvcGUuYWNjb3VudHVzZXIuZW1haWw7XG4gICAgY29uc29sZS5sb2coYWNjb3VudGVtYWlsICsgXCJhY2NvdW50ZW1haWwgcmFzY2FsXCIpO1xuXHRcdCRodHRwLnBvc3QoJy9hcGkvdGhpcmRwYXJ0eXVzZXInLCB7XG4gICAgICAgIGFjY291bnRlbWFpbDogYWNjb3VudGVtYWlsLFxuICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicmFzY2FsIHJlc1wiKTtcbiAgICAgIC8vY29uc29sZS5sb2cobGVzKTtcbiAgICB9KTsgICAgXG4gICAgcmVmcmVzaCgpO1xuICB9XG5cbiAvL2FkZCB1c2VyIGNsb3NlXG4gICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgJCgnI0FkZFVzZXInKS5tb2RhbCgnaGlkZScpO1xuICB9XG5cblxuICAvL2FkZCBzZWxlY3RlZCB1c2VyIHBhcnQgIFxuICAkc2NvcGUuYWRkdXNlciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgLy9pKys7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3RoaXJkcGFydHl1c2VyL2FkZHVzZXIvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAkc2NvcGUuYWRkdXNlciA9IHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gICAgXG4gIH1cblxuICAvL2RlbGV0ZSBzZWxlY3RlZCB1c2VyIHBhcnQgXG4gICRzY29wZS5kZWxldGV1c2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVtYWlsPSAkc2NvcGUuYWRkdXNlci5lbWFpbDtcbiAgICBjb25zb2xlLmxvZyhlbWFpbCArIFwicmFzY2FsIGVtYWlsXCIpO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS90aGlyZHBhcnR5dXNlci8nICsgZW1haWwpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgY29uc29sZS5sb2coXCJkZWxldGUgcmFzY2FsXCIpO1xuICAgICAgJHNjb3BlLmFkZHVzZXI9cmVzcG9uc2UuZGF0YTtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlICsgXCJyYXNjYWwgZGVsZXRlIHN1Y2Nlc3NcIik7XG4gICAgICAgIHJlZnJlc2goKTtcbiAgICAgIH0pO1xuICB9XG4gIC8vY29tcGxldGUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gXG4gIC8vc2F2ZSBzdWJhZG1pbiBhY2NvdW50IHBhcnQgXG4gICRzY29wZS5hZGRhY2NvdW50ID0gW107XG4gICRzY29wZS5hZGRzdWJtaXNzaW9udXNlcmV2ZW4gPSBbXTtcbiAgJHNjb3BlLmFkZHN1Ym1pc3Npb251c2VyID0gW107IFxuIFxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdWJhY2NvdW50bGVuZ3RoID0gMDtcbiAgICB2YXIgc2NoZWR1bGVyYWNjb3VudGxlbmd0aCA9IDA7XG4gICAgdmFyIHNjaGVkdWxlcmFjY291bnQgPSBbXTtcbiAgICB2YXIgc3VibWlzc2lvbmFjY291bnRsaXN0ID0gW107XG4gICAgdmFyIHN1Ym1pc3Npb25hY2NvdW50ID0gW107XG4gICAgdmFyIHN1Ym5hbWUgPSBbXTtcbiAgICB2YXIgc3ViZW1haWwgPSBbXTtcbiAgICBjb25zb2xlLmxvZygkc2NvcGUuYWRkYWNjb3VudC5sZW5ndGggKyBcIiAkc2NvcGUuYWRkYWNjb3VudC5sZW5ndGhcIik7XG4gICAgZm9yICh2YXIgaSA9ICRzY29wZS5hZGRhY2NvdW50Lmxlbmd0aDsgaSA+IDA7IGktLSkge1xuICAgICAgaWYgKCRzY29wZS5hZGRhY2NvdW50W2ldKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGkgKyBcIiBpXCIpO1xuICAgICAgICBzY2hlZHVsZXJhY2NvdW50W3NjaGVkdWxlcmFjY291bnRsZW5ndGhdPUpTT04ucGFyc2UoJHNjb3BlLmFkZGFjY291bnRbaV0pO1xuICAgICAgICBzY2hlZHVsZXJhY2NvdW50bGVuZ3RoKys7XG4gICAgICB9OyAgICAgXG4gICAgfTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgJHNjb3BlLmFkZHN1Ym1pc3Npb251c2VyZXZlbi5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKCRzY29wZS5hZGRzdWJtaXNzaW9udXNlcmV2ZW5bal0pIHtcbiAgICAgICAgY29uc29sZS5sb2coaiArIFwiIGpcIik7XG4gICAgICAgIHN1Ym1pc3Npb25hY2NvdW50bGlzdFtzdWJhY2NvdW50bGVuZ3RoXT1KU09OLnBhcnNlKCRzY29wZS5hZGRzdWJtaXNzaW9udXNlcmV2ZW5bal0pO1xuICAgICAgICBzdWJuYW1lW3N1YmFjY291bnRsZW5ndGhdID0gc3VibWlzc2lvbmFjY291bnRsaXN0W3N1YmFjY291bnRsZW5ndGhdLm5hbWU7XG4gICAgICAgIHN1YmVtYWlsW3N1YmFjY291bnRsZW5ndGhdID0gc3VibWlzc2lvbmFjY291bnRsaXN0W3N1YmFjY291bnRsZW5ndGhdLmVtYWlsO1xuICAgICAgICBzdWJhY2NvdW50bGVuZ3RoKys7XG4gICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgY29uc29sZS5sb2coc3ViYWNjb3VudGxlbmd0aCArIFwiIHN1YmFjY291bnRsZW5ndGhcIik7XG4gICAgZm9yICh2YXIgbCA9IDA7IGwgPCAkc2NvcGUuYWRkc3VibWlzc2lvbnVzZXIubGVuZ3RoOyAgbCsrICkge1xuICAgICAgaWYgKCRzY29wZS5hZGRzdWJtaXNzaW9udXNlcltsXSkge1xuICAgICAgICBzdWJtaXNzaW9uYWNjb3VudGxpc3Rbc3ViYWNjb3VudGxlbmd0aF09SlNPTi5wYXJzZSgkc2NvcGUuYWRkc3VibWlzc2lvbnVzZXJbbF0pO1xuICAgICAgICBzdWJuYW1lW3N1YmFjY291bnRsZW5ndGhdID0gc3VibWlzc2lvbmFjY291bnRsaXN0W3N1YmFjY291bnRsZW5ndGhdLm5hbWU7XG4gICAgICAgIHN1YmVtYWlsW3N1YmFjY291bnRsZW5ndGhdID0gc3VibWlzc2lvbmFjY291bnRsaXN0W3N1YmFjY291bnRsZW5ndGhdLmVtYWlsO1xuICAgICAgICBzdWJhY2NvdW50bGVuZ3RoKys7XG4gICAgICB9O1xuICAgIH07XG4gICAgc3VibWlzc2lvbmFjY291bnRbMF0gPSBzdWJuYW1lO1xuICAgIHN1Ym1pc3Npb25hY2NvdW50WzFdID0gc3ViZW1haWw7XG4gICAgJGh0dHAucG9zdCgnL2FwaS90aGlyZHBhcnR5dXNlci9zYXZlYWNjb3VudCcsIHtcbiAgICAgICAgdXNlcmVtYWlsOiAkc2NvcGUuYWRkdXNlci5lbWFpbCxcbiAgICAgICAgc2NoZWR1bGVyYWNjb3VudCA6IHNjaGVkdWxlcmFjY291bnQsXG4gICAgICAgIHN1Ym1pc3Npb25hY2NvdW50IDogc3VibWlzc2lvbmFjY291bnRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInJhc2NhbCByZXNcIik7XG4gICAgICB9KTtcbiAgfVxuIFxuICBcblxufSk7XG4iXSwiZmlsZSI6InRoaXJkcGFydHkvY29udHJvbGxlcnMvdGhpcmRwYXJ0eS5qcyJ9
