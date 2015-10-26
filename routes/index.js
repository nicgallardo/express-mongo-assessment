var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/teamCreator')
var Teams = db.get('teams');
var Coaches = db.get('coaches');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//create team works
router.get('/create-team', function(req, res, next) {
  res.render('create-team');
})

router.post('/createlineup', function(req, res) {
  // console.log(req.body);
  return Teams.insert({
    teamCity: req.body.teamCity,
    teamName: req.body.teamName,
  }).then(function (team){
    return Coaches.insert({
      coachName: req.body.coachName,
      teamCity: team.city,
      teamName: team.teamName,
      teamID: team._id})
  }).then(function (coach){
    return Teams.update(
      {teamName: req.body.teamName},
      {
        teamCity: req.body.teamCity,
        teamName: req.body.teamName,
        teamCoach: req.body.coachName,
        coachId: coach._id
      })
  }).then(function (){
    res.redirect('/')
  })
});

//created to test for mongo it works
// router.post('/createlineup', function(req, res) {
//   Teams.insert({
//     teamcity: req.body.teamCity,
//   })
//   res.redirect("/")
// });

router.get('/teams', function(req, res) {
  res.render('teams')
})
module.exports = router;
