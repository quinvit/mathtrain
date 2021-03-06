Questions = new Mongo.Collection("questions");
Questions._ensureIndex({"question": 1});

Meteor.startup(function () {
    Quest.generate();
});

Quest = {
    random: function (min, max) {
        return ~~((Math.random() * (max - min)) + min);
    },
    formulas: {
        random: function (min, max) {
            return Quest.random(min, max);
        },
        '+': function (min, max) {
            var x = this.random(min, max);
            var y = this.random(min, max);

            if (x === 0 && y === 0) {
                return this.formulas['+'](min, max);
            }

            return [x, y, x + y];
        },
        '-': function (min, max) {
            var x = this.random(min, max);
            var y = this.random(min, max);

            // x > y rule
            if (x < y) {
                var z = x;
                x = y;
                y = z;
            }

            if (x === 0 && y === 0) {
                return this.formulas['-'](min, max);
            }

            return [x, y, x - y];
        },
        '*': function (min, max) {
            var x = this.random(min, max);
            var y = this.random(min, max);

            if (x === 0 && y === 0) {
                return this.formulas['*'](min, max);
            }

            return [x, y, ~~(x * y)];
        },
        '/': function (min, max) {
            var x = this.random(min, max);
            var y = this.random(min, max);

            // x % y = 0 rule
            return [~~(x * y), y, x];
        },
        '~': function (z) {
            var i = 1;
            if (z < 10) {
                i = this.random(1, 10) + z;
            }
            else {
                var d = ~(z / 10);
                d = d < 1 ? ([1, 3, 5])[this.random(0, 2)] : ~~(d / 2 * 10);
                d = d == 0 ? this.random(1, 10) : d;
                i = z <= d ? z + d : z - d;
            }

            return i == 0 ? this.random(1, 10) : i;
        }
    },
    levels: {
        'beginner': {
            formulas: ['+', '-'],
            '+': {
                max_number: 15,
                min_number: 1
            },
            '-': {
                max_number: 15,
                min_number: 0
            }
        },
        'junior': {
            formulas: ['+', '-'],
            '+': {
                max_number: 50,
                min_number: 15
            },
            '-': {
                max_number: 50,
                min_number: 15
            }
        },
        'senior': {
            formulas: ['+', '-', '*', '/'],
            '+': {
                max_number: 80,
                min_number: 25
            },
            '-': {
                max_number: 80,
                min_number: 25
            },
            '*': {
                max_number: 15,
                min_number: 2
            },
            '/': {
                max_number: 15,
                min_number: 2
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
        },
        'super': {
            formulas: ['+', '-', '*', '/'],
            '+': {
                max_number: 150,
                min_number: 50
            },
            '-': {
                max_number: 150,
                min_number: 50
            },
            '*': {
                max_number: 50,
                min_number: 20
            },
            '/': {
                max_number: 50,
                min_number: 20
            }
        }
    },
    levelIndexes: ['beginner', 'junior', 'senior', 'master', 'super'],
    generate: function (levelIndex) {
        var levelName = this.levelIndexes[~~levelIndex];
        var level = this.levels[levelName] || this.levels.beginner;

        // Random operator
        var f = level.formulas[this.random(0, level.formulas.length)];

        // Generate factors base on operator
        var factors = this.formulas[f](level[f].min_number, level[f].max_number);

        var x = factors[0];
        var y = factors[1];
        var z = factors[2];

        // Random detractor for answers
        var d = this.formulas['~'](z);

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
};

Meteor.methods({
    next: function (level) {
        var q = Quest.generate(level);
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
