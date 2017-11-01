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
    
    function createToggle(name,initial){
        self[name] = ko.observable(initial);
        self['toggle'+name] = function(){ self[name](!self[name]()); }
    }

    createToggle('ShowSetup', true);
    createToggle('ShowDataEntry', false);
    createToggle('ShowResults', false);

    self.Questions = ko.observable(0);
    self.Questions.subscribe(function(num){
        if(num <= 0){
            self.ShowSetup(true);
            self.ShowDataEntry(false);
            self.ShowResults(false);
        }else{
            self.ShowDataEntry(true);
            self.ShowResults(false);
        }
    })
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
        classPeriod.tallyScores();
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
            current.tallyScores();
        }
    }
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