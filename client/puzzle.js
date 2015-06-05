var tmr = 0;
Puzzle = {
    nextChallenge: function () {
        tmr && clearTimeout(tmr);

        Meteor.call('next', Puzzle.currentLevel(), function (err, challenge) {
            Puzzle.currentChallenge(challenge);
            Puzzle.currentResult(null);
            Progress.reset();
        });
    },
    pauseTime: 1000,
    right: function (value) {
        if (typeof value != 'undefined') {
            Session.set('right', ~~value);
        }

        return ~~Session.get('right');
    },
    wrong: function (value) {
        if (typeof value != 'undefined') {
            Session.set('wrong', ~~value);
        }

        return ~~Session.get('wrong');
    },
    playing: function (value) {
        if (typeof value != 'undefined') {
            Session.set('playing', !!value);
        }

        return !!Session.get('playing');
    },
    currentResult: function (value) {
        if (typeof value != 'undefined') {
            Session.set('currentResult', value);
        }

        return Session.get('currentResult');
    },
    currentLevel: function (value) {
        if (typeof value != 'undefined') {
            Session.set('currentLevel', ~~value);
        }

        return ~~Session.get('currentLevel');
    },
    currentChallenge: function (value) {
        if (typeof value != 'undefined') {
            Session.set('currentChallenge', value);
        }

        return Session.get('currentChallenge');
    },
    welcomeText: function (value) {
        if (typeof value != 'undefined') {
            Session.set('welcomeText', value);
        }

        return Session.get('welcomeText');
    },
    checkLevel: function () {
        var right = Puzzle.right();
        var wrong = Puzzle.wrong();
        var level = Puzzle.currentLevel();

        // Best learning factor: 50%-85%
        // Min 10 answers and correct answer is higher than 85%
        if (level < 3 && right > 5 && ((right / wrong) * 100 > 85)) {
            // Improve one level
            Puzzle.currentLevel(++level);

            // Reset counter
            Puzzle.right(0);
            Puzzle.wrong(0);

        }
        else if (level >= 1 && wrong > 2 && ((right / wrong) * 100 < 50)) {
            // Down one level
            // Improve one level
            Puzzle.currentLevel(--level);

            // Reset counter
            Puzzle.right(0);
            Puzzle.wrong(0);
        }

        return level;
    },
    checkAnswer: function (right) {
        if (right === null) {
            return null;
        }

        // Auto jump to next question after 3 seconds
        if (right) {
            Puzzle.right(Puzzle.right() + 1);
        }
        else {
            Puzzle.wrong(Puzzle.wrong() + 1);
        }

        Puzzle.checkLevel();
        Puzzle.currentResult(right ? 'correct' : 'incorrect');

        Puzzle.next();
    },
    next: function (time) {
        Progress.pause();
        tmr = setTimeout(Puzzle.nextChallenge, time || Puzzle.pauseTime);
    },
    play: function () {
        Puzzle.nextChallenge();
        Puzzle.playing(true);
    },
    pause: function () {
        tmr && clearTimeout(tmr);
        Puzzle.playing(false);
    },
    stop: function () {
        tmr && clearTimeout(tmr);
        Puzzle.wrong(0);
        Puzzle.right(0);
        Puzzle.currentLevel(0);
        Puzzle.playing(false);
    }
};

Template.question.helpers({
    challenge: function () {
        return Puzzle.currentChallenge();
    },
    level: function() {
        return Puzzle.currentLevel();
    },
    playing: function () {
        return Puzzle.playing();
    }
});

Template.content.helpers({
    challenge: function () {
        return Puzzle.currentChallenge();
    },
    result: function () {
        return Puzzle.currentResult();
    },
    waiting: function () {
        return Puzzle.currentResult() != null;
    }
});

Template.content.events({
    'click #answerA': function () {

        if(Puzzle.currentResult()) {
            return;
        }

        Progress.pause();
        Meteor.call('answer', Puzzle.currentChallenge().question, $('#answerA').text(), function (err, status) {
            Puzzle.checkAnswer(status);
        });
    },
    'click #answerB': function () {

        if(Puzzle.currentResult()) {
            return;
        }

        Progress.pause();
        Meteor.call('answer', Puzzle.currentChallenge().question, $('#answerB').text(), function (err, status) {
            Puzzle.checkAnswer(status);
        });
    }
});

Template.control.events({
    'click #next': function () {
        Puzzle.nextChallenge();
    },
    'click #pause': function () {
        Puzzle.pause();
    },
    'click #stop': function () {
        Puzzle.stop();
    },
    'click #play': function () {
        Puzzle.play();
    }
});

Puzzle.welcomeText('Be quick don\'t be hurry');

Progress.on('drain', function () {
    Puzzle.next(Puzzle.pauseTime * 2);
    Puzzle.currentResult('timed out');
});

Progress.pause();
