var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/teamCreator')
var Teams = db.get('teams');
var Coaches = db.get('coaches');
var Rosters = db.get('rosters')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//create team works
router.get('/create-team', function(req, res, next) {
  res.render('create-team');
})

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

router.post('/createlineup', function(req, res) {
  var teamCityNormalized = normalize(req.body.teamCity);
  var teamNameNormalized = normalize(req.body.teamName);
  var teamCoach = normalize(req.body.coachName);
  return Teams.insert({
    teamCity: teamCityNormalized,
    teamName: teamNameNormalized,
  }).then(function (team){
    return Coaches.insert({
      coachName: teamCoach,
      teamCity: team.teamCity,
      teamName: team.teamName,
      teamID: team._id})
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

router.get('/add-athlete/:id', function(req, res){
  Teams.findOne({_id: req.params.id}, function (err, team) {
    res.render('add-athlete', {team: team })
  });
});

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
      // console.log(team);
      return Rosters.insert({
        firstName: firstName,
        lastName: lastName,
        position: req.body.position,
        number: joinedNumber,
        height: joinedHeight,
        weight: joinedWeight,
        teamCity: team.teamCity,
        teamName: team.teamName,
        teamId: req.body.teamId
      })
    }).then(function(roster){
      res.redirect('teams')//req.params.id?
    })
  }
});

router.get('/teams/:id', function(req, res){
  return Teams.findOne({_id: req.params.id}, function (err, team) {
  }).then(function(team){
    Rosters.find({teamName: team.teamName}, function (err, athletes){
      console.log(athletes);
      res.render('team-roster', {team: team, athletes: athletes });
    })
  })
});

router.get("/athlete/:id", function(req, res){
  return Rosters.findOne({_id: req.params.id}, function(err, athlete){
  }).then(function(athlete){
    Teams.findOne({teamName: athlete.teamName}, function(err, team){
      res.render('athlete-show', {athlete: athlete, team: team});
    })
  })
})

router.get('/coaches', function(req, res){
  Coaches.find({}, function (err, coaches) {
    res.render('coaches', {coaches: coaches })
  });
});

router.get('/coaches/:id', function(req, res){
  console.log(req.params.id);
  Coaches.findOne({_id: req.params.id}, function (err, coach) {
    console.log(coach);
    res.render('coaches-view', {coach: coach })
  });
});


module.exports = router;
