var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/teamCreator')
var Teams = db.get('teams');
var Coaches = db.get('coaches');
var Athletes = db.get('athletes')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



//refactor idea
//place these two functions below in sperate js files
function normalize(string){
  var normalizedString = string.trim().toLowerCase().split("");
  var zeroIndex = normalizedString.shift();
  var zeroIndexCap = zeroIndex.toUpperCase();
  normalizedString.unshift(zeroIndexCap);
  return normalizedString.join("");
}
function concateNumber(numb1, numb2, numb3){
  var number = [];
  number.push(numb1, numb2, numb3);
  return number.join("");
}
//creat-team route
router.get('/create-team', function(req, res, next) {
  res.render('create-team');
})
//create-team action and mongo input this also creates the coach for the team
//in a new collection
router.post('/create-team', function(req, res) {
  var teamCityNormalized = normalize(req.body.teamCity);
  var teamNameNormalized = normalize(req.body.teamName);
  var teamCoach = normalize(req.body.coachName);
  return Teams.insert({
    teamCity: teamCityNormalized,
    teamName: teamNameNormalized,
  }).then(function (team){
    return Coaches.insert({
      coachName: teamCoach,
      teamId: team._id})
  }).then(function (coach){
    return Teams.update(
      {teamName: teamNameNormalized},
      {
        teamCity: teamCityNormalized,
        teamName: teamNameNormalized,
        teamCoach: teamCoach,
        coachId: coach._id
      })
  }).then(function (){
    res.redirect('/')
  })
});

router.get('/teams', function(req, res ){
  return Teams.find({}, function(err, teams){
  }).then(function (teams){
    Coaches.find({}, function(err, coaches){
      console.log(coaches);
      res.render('teams', {
        teams: teams,
        coaches: coaches
      })
    })
  })
});
//team update route
router.get('/teams/:id/edit', function(req, res){
  Teams.findOne({_id: req.params.id}, function(err, team){
  res.render("edit-team", {team: team});
  });
});
//team update action and mongo update
router.post('/edit-team', function(req, res){
  return Teams.updateById(req.body.teamId,
    {$set: {
              teamCity: req.body.teamCity,
              teamName: req.body.teamName,
            }
    },
    function (err, team){
      if(err){
        console.log(err);
      }
    }
  ).then(function(){
    res.redirect('/teams');
  })
});

//team show
router.get('/teams/:id', function(req, res){
  return Teams.findOne({_id: req.params.id}, function (err, team) {
  }).then(function(team){
    Athletes.find({teamName: team.teamName}, function (err, athletes){
      console.log(athletes);
      res.render('team-roster', {team: team, athletes: athletes });
    })
  })
});

//team delete
router.post('/teams/:id/delete', function(req, res){
  Teams.remove({_id: req.params.id}, function(err, team){
    res.redirect('/teams')
  })
})

//athlete route
router.get('/add-athlete/:id', function(req, res){
  Teams.findOne({_id: req.params.id}, function (err, team) {
    res.render('add-athlete', {team: team })
  });
});

//athlete create validation with mongo input
router.post('/createplayer', function(req, res){
  var errors = [];
  if(req.body.firstName.length < 1) errors.push("The players first name must be filled out");
  if(req.body.lastName.length < 1) errors.push("The players last name must be filled out");
  if(req.body.feet == undefined) errors.push("The players height attribute must be filled out");
  if(req.body.inches == undefined) errors.push("The players height attribute must be filled out");
  if(req.body.numberIndexOne == undefined) errors.push("The players number must be filled out");
  if(req.body.weightOne == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.weightTwo == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.weightThree == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.position == undefined) errors.push("The players position must be selected");
  if(req.body.teamId == undefined) errors.push("You must select the current team id from below");
  if(errors.length > 0){
    var errorMsg = "";
    if(errors.length > 1) errorMsg = "Please fix errors before moving forward...";
    if(errors.length == 1) errorMsg = "Please fix your error before you proceed";
    Teams.findOne({_id: req.body.teamId}, function (err, team) {
    res.render('show', {team: team, errors: errors, errorMsg: errorMsg})
    })
  }else{
    var joinedHeight = concateNumber(req.body.feet, req.body.inches);
    var joinedNumber = concateNumber(req.body.numberIndexZero, req.body.numberIndexOne);
    var joinedWeight = concateNumber(req.body.weightOne, req.body.weightTwo, req.body.weightThree);
    var firstName = normalize(req.body.firstName);
    var lastName = normalize(req.body.lastName)
    return Teams.findOne({_id: req.body.teamId}, function (err, team){
        // console.log(team);
    }).then(function(team){
      console.log(team);
      return Athletes.insert({
        firstName: firstName,
        lastName: lastName,
        position: req.body.position,
        number: joinedNumber,
        height: joinedHeight,
        weight: joinedWeight,
        teamName: team.teamName,
        teamId: req.body.teamId
      })
    }).then(function(){
      res.redirect('teams')//req.params.id on refactor???
    })
  }
});

//athlete show page
router.get('/athlete/:id', function(req, res){
  return Athletes.findOne({_id: req.params.id}, function(err, athlete){
  }).then(function(athlete){
    Teams.findOne({_id: athlete.teamId}, function(err, team){
      console.log(team);
      res.render('athlete-show', {athlete: athlete, team: team});
    })
  })
});


router.get('/athlete/:id/edit', function(req, res){
  return Athletes.findOne({_id: req.params.id}, function(err, athlete){
  }).then(function(athlete){
    Teams.findOne({_id: athlete.teamId}, function(err, team){
      console.log("athlete", athlete);
      console.log("team-info", team);
      res.render('athlete-edit', {athlete: athlete, team: team});
    })
  })
});

router.post('/athlete-edit', function(req, res){
  var errors = [];
  if(req.body.firstName.length < 1) errors.push("The players first name must be filled out");
  if(req.body.lastName.length < 1) errors.push("The players last name must be filled out");
  if(req.body.feet == undefined) errors.push("The players height attribute must be filled out");
  if(req.body.inches == undefined) errors.push("The players height attribute must be filled out");
  if(req.body.numberIndexOne == undefined) errors.push("The players number must be filled out");
  if(req.body.weightOne == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.weightTwo == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.weightThree == undefined) errors.push("The players weight attribute must be filled out");
  if(req.body.position == undefined) errors.push("The players position must be selected");
  if(req.body.teamId == undefined) errors.push("You must select the current team id from below");
  if(errors.length > 0){
    var errorMsg = "";
    if(errors.length > 1) errorMsg = "Please fix errors before moving forward...";
    if(errors.length == 1) errorMsg = "Please fix your error before you proceed";
    return Athletes.findOne({_id: req.body.athleteId}, function (err, athlete) {
  }).then(function(athlete){
    Teams.findOne({_id: req.body.teamId}, function(err, team) {
      res.render('athlete-edit', {athlete: athlete, team: team, errors: errors, errorMsg: errorMsg})
    })
  })
  }else{
    var joinedHeight = concateNumber(req.body.feet, req.body.inches);
    var joinedNumber = concateNumber(req.body.numberIndexZero, req.body.numberIndexOne);
    var joinedWeight = concateNumber(req.body.weightOne, req.body.weightTwo, req.body.weightThree);
    var firstName = normalize(req.body.firstName);
    var lastName = normalize(req.body.lastName)
    console.log(req.body);
    return Athletes.updateById(req.body.athleteId,
      {$set: {
                firstName: firstName,
                lastName: lastName,
                position: req.body.position,
                number: joinedNumber,
                height: joinedHeight,
                weight: joinedWeight,
                teamName: req.body.teamName,
                teamId: req.body.teamId
              }
      },
      function (err, team){
        if(err){
          console.log(err);
        }
      }
    ).then(function(){
      res.redirect('/teams');
    })
  }
});

// athlete delete
router.post('/athletes/:id/delete', function(req, res){
  console.log(req.params.id);
  Athletes.remove({_id: req.params.id}, function(err, athlete){
    res.redirect('/')
  })
})

//coaches route
router.get('/coaches', function(req, res){
  Coaches.find({}, function (err, coaches) {
    res.render('coaches', {coaches: coaches })
  });
});
//coaches show
router.get('/coaches/:id', function(req, res){
  return Coaches.findOne({_id: req.params.id}, function (err, coach) {
  }).then(function(coach){
    Teams.findOne({_id: coach.teamId}, function(err, team){
      console.log(team);
      res.render('coaches-show', {coach: coach, team: team});
    });
  });
});
//coaches edit
router.get('/coaches/:id/edit', function(req, res){
  return Coaches.findOne({_id: req.params.id}, function(err, coach){
  }).then(function(coach){
    Teams.findOne({_id: coach.teamId}, function(err, team ){
      res.render('coach-edit', {coach: coach, team: team})
    })
  })
});
//router  edit post
router.post('/coach-edit', function(req, res){
  console.log(req.body);
  Coaches.updateById(req.body.coachId,
    {$set: {
              coachName: req.body.coachName,
    }
  },
  function (err, coach){
    if(err){
      console.log(err);
      }
    }
  )
    res.redirect('/coaches')
})

//delete coach
router.post('/coach/:id/delete', function(req, res){
  console.log(req.params.id);
  Coaches.remove({_id: req.params.id}, function(err, coach){
    res.redirect('/coaches')
  })
})


module.exports = router;
