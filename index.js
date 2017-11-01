ko.bindingHandlers.enterkey = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

var MainViewModel = function(){
    var self = this;

    function ClassPeriod(){
        var that = this;
        that.Name = ko.observable("New Hour");
        that.NumberOfStudents = ko.observable(1);
        that.MissedQuestions = ko.observableArray();
        that.Tallies = ko.observable();

        that.RemoveQuestion = function(question){
            var removed = that.MissedQuestions.remove(question); // remove all who match the number
            removed.forEach(function(r){ that.MissedQuestions.unshift(r); }); // put them in front
            that.MissedQuestions.shift(); // knock one off
        }
    }

    function tallyScores(missedQs){
        var rtn = [];
        
        missedQs.forEach(function(q) {
            if(rtn[q] == undefined){
                rtn[q] = 1;
            }else{
                rtn[q] += 1;
            }
        }, this);

        console.log(rtn);
        return rtn;
    }

    self.Questions = ko.observable(10);
    self.QuestionsArray = ko.pureComputed(function(){
        function QuestionButton(index){
            var that = this;
            that.Number = index+1;
            that.Value = ko.observable(false);
            that.toggle = function () { that.Value(!that.Value()); }
        }

        var numberOfQuestions = self.Questions(),
            rtn = [];

        for(var i=0; i<numberOfQuestions; i++){
            rtn[i] = new QuestionButton(i);
        }
        return rtn;
    });
    self.submitMultipleQuestions = function(){
        var questions = self.QuestionsArray();
            selectedQs = questions.filter(function(q){
                return q.Value();
            }),
            c = self.SelectedClassPeriod(),
            qs = c.MissedQuestions;

        selectedQs.forEach(function(q){
            qs.push(q.Number);
            q.toggle();
        });

        self.tallyScores();
    }

    self.ClassPeriods = ko.observableArray();
    self.SelectedClassPeriod = ko.observable();
    self.SelectedClassPeriod.subscribe(function (classPeriod){
        classPeriod.Tallies(tallyScores(classPeriod.MissedQuestions()));
    })
    self.MissedQuestion = ko.observable();

    self.NumberOfClassPeriods = ko.pureComputed(function(){
        return self.ClassPeriods().length;
    });
    self.IsMissedQuestionValid = ko.pureComputed(function(){
        var q = self.MissedQuestion();
        if(parseInt(q) == NaN){
            return "Only numbers allowed"
        }else if(q <= 0 || q > self.Questions()){
            return "Question is out of bounds";
        }else{
            return true;
        }
    });

    self.addClassPeriod = function () {
        var newClass = new ClassPeriod();
        self.ClassPeriods.push(newClass);
        self.selectClassPeriod(newClass);
    }
    self.selectClassPeriod = function (classPeriod) {
        self.SelectedClassPeriod(classPeriod);
    }
    self.SubmitMissedQuestion = function(){
        var c = self.SelectedClassPeriod(),
            qs = c.MissedQuestions;
        if(self.IsMissedQuestionValid() === true){
            qs.push(self.MissedQuestion());
            self.MissedQuestion(undefined);
        }
    }
    self.tallyScores = function(){
        var current = self.SelectedClassPeriod();
        if(current){
            current.Tallies(tallyScores(current.MissedQuestions()));
        }
    };

    self.exportToCSV = function(){
        self.tallyScores();
        const rows = self.SelectedClassPeriod().Tallies();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += 'Question,Marks\n'
        rows.forEach(function (data,index) {
            let row = index + ',' + data;
            csvContent += row + "\n";
        });

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }

    self.addClassPeriod();
}
ko.applyBindings(MainViewModel);