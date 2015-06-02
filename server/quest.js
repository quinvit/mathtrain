Meteor.startup(function () {
    Questions.remove({});
    nextQuestion();
});

var Questions = new Mongo.Collection("questions");
Questions._ensureIndex({"question": 1});

function getRandomInt(min, max) {
    return ~~((Math.random() * (max - min)) + min);
}

var formulas = {
    '+': function (min, max) {
        var x = getRandomInt(min, max);
        var y = getRandomInt(min, max);

        return [x, y, x + y];
    },
    '-': function (min, max) {
        var x = getRandomInt(min, max);
        var y = getRandomInt(min, max);

        // x > y rule
        x = (x < y || x === 0) ? y + 1 : x;

        return [x, y, x - y];
    },
    '*': function (min, max) {
        var x = getRandomInt(min, max);
        var y = getRandomInt(min, max);

        return [x, y, ~~(x * y)];
    },
    '/': function (min, max) {
        var x = getRandomInt(min, max);
        var y = getRandomInt(min, max);

        // x % y = 0 rule
        return [~~(x * y), y, x];
    },
    '~': function (z) {
        var i = 1;
        if (z < 10) {
            i = (Math.random() * z) >> 0;
        }
        else {
            var r = (Math.random() * 7);
            var test = (~~r) % 2;

            r = ~~r * 10;
            r = (r === 0 || r > z) ? 10 : r;
            i = ~~(test ? z + r : z - r);
        }

        return i === 0 ? z + 1 : i;
    }
};

var levels = {
    'baby': {
        formulas: ['+', '-'],
        '+': {
            max_number: 10,
            min_number: 0
        },
        '-': {
            max_number: 10,
            min_number: 0
        }
    },
    'junior': {
        formulas: ['+', '-'],
        '+': {
            max_number: 50,
            min_number: 10
        },
        '-': {
            max_number: 50,
            min_number: 10
        }
    },
    'senior': {
        formulas: ['+', '-', '*', '/'],
        '+': {
            max_number: 80,
            min_number: 10
        },
        '-': {
            max_number: 80,
            min_number: 10
        },
        '*': {
            max_number: 15,
            min_number: 1
        },
        '/': {
            max_number: 15,
            min_number: 1
        }
    },
    'master': {
        formulas: ['+', '-', '*', '/'],
        '+': {
            max_number: 100,
            min_number: 20
        },
        '-': {
            max_number: 100,
            min_number: 20
        },
        '*': {
            max_number: 20,
            min_number: 10
        },
        '/': {
            max_number: 20,
            min_number: 10
        }
    }
}

var levelIndexes = ['baby', 'junior', 'senior', 'master'];

function nextQuestion(levelIndex) {

    var levelName = levelIndexes[levelIndex];
    var level = levels[levelName] || levels.baby;

    // Random operator
    var f = level.formulas[getRandomInt(0, level.formulas.length)];

    // Generate factors base on operator
    var factors = formulas[f](level[f].min_number, level[f].max_number);

    var x = factors[0];
    var y = factors[1];
    var z = factors[2];

    // Random detractor for answers
    var d = formulas['~'](z);

    var a = (d % 2) ? z : d;
    var b = (d % 2) ? d : z;

    var q = {
        question: [x, ' ', f, ' ', y, ' = ?'].join(''),
        answers: {
            answerA: a,
            answerB: b
        },
        correct_answer: z
    };

    // Store question for checking later
    var existingQuestion = Questions.find({question: q.question});
    if (!existingQuestion.question) {
        Questions.insert(q);
    }
    else {
        q = existingQuestion;
    }

    return {
        level: levelName,
        question: q.question,
        answers: q.answers
    };
}

Meteor.methods({
    next: function (level) {
        var q = nextQuestion(level);
        return q;
    },
    answer: function (q, a) {

        if (!q || !a) {
            return null;
        }

        var question = Questions.findOne({question: q});

        if (!question) {
            return null;
        }

        return (a == question.correct_answer);
    }
});
