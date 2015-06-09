var tmr = 0;
var deadCount = 0;

Puzzle = {
    nextChallenge: function () {
        tmr && clearTimeout(tmr);

        Meteor.call('next', Puzzle.currentLevel.get(), function (err, challenge) {
            Puzzle.currentChallenge.set(challenge);
            Puzzle.currentResult.set();
            Progress.reset();
        });
    },
    pauseTime: 1000,
    right: new ReactiveVar(),
    wrong: new ReactiveVar(),
    playing: new ReactiveVar(),
    currentResult: new ReactiveVar(),
    currentLevel: new ReactiveVar(),
    currentChallenge: new ReactiveVar(),
    welcomeText: new ReactiveVar(),
    checkLevel: function () {
        var right = Puzzle.right.get();
        var wrong = Puzzle.wrong.get();
        var level = Puzzle.currentLevel.get();

        // Best learning factor: 50%-85%
        // Min 10 answers and correct answer is higher than 85%
        if (level < 3 && right > 10 && ((right / wrong) * 100 > 85)) {
            // Improve one level
            Puzzle.currentLevel.set(++level);

            // Reset counter
            Puzzle.right.set(0);
            Puzzle.wrong.set(0);

        }
        else if (level >= 1 && wrong > 2 && ((right / wrong) * 100 < 50)) {
            // Down one level
            // Improve one level
            Puzzle.currentLevel.set(--level);

            // Reset counter
            Puzzle.right.set(0);
            Puzzle.wrong.set(0);
        }

        return level;
    },
    checkAnswer: function (right) {
        Puzzle.currentResult.set(right ? 'correct' : 'incorrect');

        // Auto jump to next question after 3 seconds
        if (right) {
            Puzzle.right.set(Puzzle.right.get() + 1);
        }
        else {
            Puzzle.wrong.set(Puzzle.wrong.get() + 1);
            deadCount++;
        }

        Puzzle.checkLevel();
        Puzzle.next();
    },
    next: function (time) {
        Progress.pause();
        tmr = setTimeout(Puzzle.nextChallenge, time || Puzzle.pauseTime);
    },
    play: function () {
        Puzzle.nextChallenge();
        Puzzle.playing.set(true);
    },
    pause: function () {
        tmr && clearTimeout(tmr);

        Puzzle.playing.set(false);

        Progress.stop();
    },
    stop: function () {
        tmr && clearTimeout(tmr);

        Puzzle.wrong.set(0);
        Puzzle.right.set(0);
        Puzzle.currentLevel.set(0);
        Puzzle.playing.set(false);

        Progress.stop();
    }
};

Template.question.helpers({
    challenge: function () {
        return Puzzle.currentChallenge.get();
    },
    level: function () {
        return Puzzle.currentLevel.get();
    },
    playing: function () {
        return Puzzle.playing.get();
    }
});

Template.control.helpers({
    playing: function () {
        return Puzzle.playing.get();
    }
});

Template.content.helpers({
    challenge: function () {
        return Puzzle.currentChallenge.get();
    },
    result: function () {
        return Puzzle.currentResult.get();
    },
    waiting: function () {
        return !Puzzle.currentResult.get();
    }
});

Template.content.events({
    'click #answerA': function () {

        if (Puzzle.currentResult.get()) {
            return;
        }

        Progress.pause();

        Meteor.call('answer', Puzzle.currentChallenge.get().question, $('#answerA').text(), function (err, status) {
            Puzzle.checkAnswer(status);
        });
    },
    'click #answerB': function () {

        if (Puzzle.currentResult.get()) {
            return;
        }

        Progress.pause();

        Meteor.call('answer', Puzzle.currentChallenge.get().question, $('#answerB').text(), function (err, status) {
            Puzzle.checkAnswer(status);
        });
    }
});

Template.control.events({
    'click #next': function () {
        Puzzle.nextChallenge.get();
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

/************
 Timeout when drain
 *************/
Tracker.autorun(function () {
    // get drain status
    var value = Progress.drain();
    if (value) {
        Puzzle.next(Puzzle.pauseTime * 2);
        Puzzle.currentResult.set('timed out');
    }
});

Puzzle.welcomeText.set('Be quick don\'t be hurry');