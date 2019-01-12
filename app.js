//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            expense: [],
            income: [],
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1,
    };
    return {
        addItem: function(type, des, val){
            var newItem, id;

            //[1,2,3,4,5]. next ID = 6
            //[1,2,4,6,8,]. next ID = 9
            //ID = last ID + 1

            //create new id
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //re-create ne item based on income or expense type
            if(type === 'expense'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'income'){
                newItem = new Income(ID, des, val);
            }
            //push into our data structure
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            //calculate total income and expense
            calculateTotal('expense');
            calculateTotal('income');
            //calculate the budget income-expenses
            data.budget = data.totals.income - data.totals.expense;
            //calculate %age of income spent
            if (data.totals.income > 0){
            data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function(){
            data.allItems.expense.forEach(function(cur){
                cur.calcPercentage(data.totals.income);
            });
        },
        getPercentages: function(){
            var allPercentages = data.allItems.expense.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage,
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();

//UI Controller
var UIController = (function(){
    var domStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };
        var formatNumber = function(num, type){
        var num, numSplit, int, dec;
        // + or - before the number
        //exactly 2 decimal points 
        //comma seperating the thousands
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, 3);
        }
        dec = numSplit[1];
        return (type === 'expense' ? sign = '-': '+') + ' ' + int + '.' + dec;
    };
    nodeListForEach = function(list, callBack){
        for ( var i = 0; i < list.length; i++){
            callBack(list[i], i);
        }
       };
    return{
        getInput: function(){
            return{
            type:document.querySelector(domStrings.inputType).value, //will be either income or expense
            description: document.querySelector(domStrings.inputDescription).value,
            value: parseFloat(document.querySelector(domStrings.inputValue).value),
            }
        },
        addListItem: function(obj, type) { 
            var html, newHTML, element;
            //create html stirng with placeholde rtext
            if (type === 'income'){
                element = domStrings.incomeContainer
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'expense'){
                element = domStrings.expensesContainer
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace placeholder text with so e actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type) ;
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
            document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'expense');
            if(obj.percentage > 0){
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = "---";
            }
        },
        displayPercentages: function(percentages){
           var fields =  document.querySelectorAll(domStrings.expensesPercentageLabel);
           
            nodeListForEach(fields, function(current, index){
               if (percentages[index] > 0){
                current.textContent = percentages[index] + '%';
               } else {
                   current.textContent = '---';
               }
            })
        },
        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType: function(){
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },
        getdomStrings: function(){
            return domStrings;
        }
    };
})();

//Global App Controller
var controller = (function(budgetCtrl, UiCtrl){
    var setUpEventListeners = function(){
        var DOM = UIController.getdomStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAdditem);  
        document.addEventListener('keypress', function(event){
            if (event.keycode === 13 || event.which === 13){
                ctrlAdditem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(DOM.inputType).addEventListener('change', UiCtrl.changeType);
    };
    var updateBudget = function(){
        //1. calculate budget
        budgetController.calculateBudget();
        //2. Return Budget
        var budget = budgetController.getBudget();
        //3. display the budget in ui
        UiCtrl.displayBudget(budget);
    }
    var upadatePercentages = function(){
        //1. calculate the percentages
        budgetController.calculatePercentages();
        //2. read them from the budget controller
        var percentages = budgetController.getPercentages();
        //3. update ui with new percentages
        UiCtrl.displayPercentages(percentages);
        }
    var ctrlAdditem = function(){
        var input, newItem;
        //1. get field input data
        var input = UIController.getInput();
        if (input.description !== "" && !isNaN(input.value)&& input.value > 0) { 
        //2. add item to budget controller
        var newItem = budgetController.addItem(input.type, input.description, input.value);
        //3. add new item to UI
        UiCtrl.addListItem(newItem, input.type);
        //4. clear fields
        UiCtrl.clearFields();
        //5. Calculate & Update budget
        updateBudget();
        //6. Calculate & update percentages
        upadatePercentages();
        }
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from data structure
            budgetController.deleteItem(type, ID);
            //2. delete item from UI
            UiCtrl.deleteListItem(itemID);
            //3 update show new budget
            updateBudget();
            //4. Calculate & update percentages
            upadatePercentages();
        }
    };
    return {
        init: function(){
            console.log("Application has started");
            UiCtrl.displayMonth();
            UiCtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1,
            });
            setUpEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();
