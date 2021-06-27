var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home Doctor' });
});

router.get('/image', function(req, res, next) {
  res.render('image');
});

router.get('/about', function(req,res,next){
  res.render('about');
})

router.get('/doctors', function(req,res,next){
  res.render('doctors');
})

router.get('/news', function(req,res,next){
  res.render('news');
})

router.get('/protect', function(req,res,next){
  res.render('protect');
})

module.exports = router;
