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

router.get('/roster/:id', function(req, res){
  Teams.findOne({_id: req.params.id}, function (err, team) {
    res.render('show', {team: team })
  });
});

// router.post('/create-roster', function(req, res){
//   return Teams.findOne({_id: req.params.id}, function(err, team){
//   }).then(function(team){
//     return
//   })
// })


module.exports = router;
