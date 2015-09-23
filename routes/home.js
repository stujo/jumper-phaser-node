module.exports = function(app){

  app.get('/', function(req, res) {
    res.render('home/index', { title: 'Hey', message: 'Hello there!'});
  });

};

