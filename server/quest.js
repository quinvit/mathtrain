Meteor.startup(function () {
    Questions.remove({});
    nextQuestion();
});

var Questions = new Mongo.Collection("questions");
Questions._ensureIndex({"question": 1});

function getRandomInt(min, max) {
    return ((Math.random() * (max - min)) + min) >> 0;
}

var formulas = {
    '+': function (x, y) {
        return x + y;
    },
    '-': function (x, y) {
        return x - y;
    },
    '*': function (x, y) {
        return x * y;
    },
    '/': function (x, y) {
        return x / y;
    },
    '~': function (z) {
        var i = 1;
        if (z < 10) {
            i = (Math.random() * z) >> 0;
        }
        else {
            var r = (Math.random() * 7);
            var test = (~~r) % 2;

            r = r * 10;
            r = (r === 0 || r > z) ? 10 : r;
            i = (test ? z + r : z - r) >> 0;
        }

        return i === 0 ? 1 : i;
    }
};

var levels = {
    'baby': {
        formulas: ['+', '-'],
        max_number: 10,
        min_number: 0
    },
    'junior': {
        formulas: ['+', '-'],
        max_number: 100,
        min_number: 10
    },
    'senior': {
        formulas: ['+', '-', '*', '/'],
        max_number: 100,
        min_number: 10
    },
    'master': {
        formulas: ['+', '-', '*', '/'],
        max_number: 100,
        min_number: 20
    }
}

var levelIndexs = ['baby', 'junior', 'senior', 'master'];

function nextQuestion(levelIndex) {

    var level = levels[levelIndexs[levelIndex]] || levels.baby;

    var x = getRandomInt(level.min_number, level.max_number);
    var y = getRandomInt(level.min_number, level.max_number);

    var fi = (Math.random() * (level.formulas.length - 1)) >> 0;
    var f = level.formulas[fi];

    // Pre-calculation
    var z = formulas[f](x, y);

    // Random detractor
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

    var existingQuestion = Questions.find({question: q.question});

    if (!existingQuestion.question) {
        Questions.insert(q);
    }
    else {
        q = existingQuestion;
    }

    return {
        level: levelIndexs[levelIndex],
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