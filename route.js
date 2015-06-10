Router.route('/', function () {
    this.render('question');
});

Router.route('/profile', function () {
    this.render('profile');
});

Router.route('/setting', function () {
    this.render('setting');
});