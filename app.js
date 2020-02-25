var budgetController = (function(){

var data = {
  allItems: {
    inc: [],
    exp: [],
  },
  total:{
    inc: 0,
    exp: 0,
  },
  percentage:-1,
  budget:0
}

var Income = function(id,description,value){
  this.id = id;
  this.description = description;
  this.value = value;
}

var Expense = function(id,description,value){
  this.id = id;
  this.description = description;
  this.value = value;
}

var calculateTotal= function(type){
  sum = 0;
  data.allItems[type].forEach(function(current){
  sum += current.value;
});
  data.total[type] = sum;

};

return {

  addItem: function(type,des,val){
    var newItem,ID;

    if(data.allItems[type].length > 0){
      ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    }else{
      ID = 0;
    }

    if(type==='exp'){
      newItem = new Expense(ID,des,val);
    }else if(type==='inc'){
      newItem = new Income(ID,des,val);
    }

    data.allItems[type].push(newItem);

    return newItem;


  },

  calculateBudget: function(){

    calculateTotal('inc');
    calculateTotal('exp');

    data.budget = data.total.inc-data.total.exp;
    if(data.total.inc > 0){
      data.percentage = Math.round((data.total.exp/data.total.inc)*100);
    }else{
      data.percentage = -1;
    }
  },

  getBudget: function(){
      return {
        budget:data.budget,
        percentage:data.percentage,
        totalExp:data.total.exp,
        totalInc:data.total.inc,
      }
  },

  testing: function(){
    console.log(data);
  }

}

})();

var UIController = (function(){

  var html,newHtml,DOMvariable;

  DOMvariable = {
    addbtn: '.add__btn',
    inputType: '.add__type',
    inputValue: '.add__value',
    inputDescription: '.add__description',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    budgetLabel: '.budget__value',
  };

  return {


    getInput: function(){
      return {
        type: document.querySelector(DOMvariable.inputType).value, //will be either exp or inc
        description: document.querySelector(DOMvariable.inputDescription).value,
        value: parseFloat(document.querySelector(DOMvariable.inputValue).value),
      };
    },

    addListItem: function(obj,type){
      var html,newHtml,element;

      if(type==='inc'){
        element = DOMvariable.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }else if(type==='exp'){
        element = DOMvariable.expensesContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      newHtml = html.replace('%id%',obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%',obj.value);

      document.querySelector(element).insertAdjacentHTML('afterbegin',newHtml);

    },

    clearFields: function(){
      var fields;

      fields = document.querySelectorAll(DOMvariable.inputDescription + ',' + DOMvariable.inputValue);//returns a list
      //applying slice method to a list by using call
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current){
        current.value = '';
      })

      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      document.querySelector(DOMvariable.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMvariable.expensesLabel).textContent = obj.totalExp;
      document.querySelector(DOMvariable.budgetLabel).textContent = obj.budget;
      if(obj.percentage>0){
        document.querySelector(DOMvariable.percentageLabel).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMvariable.percentageLabel).textContent = '-----';
      }
    },

    getDOMvariables: function(){
      return DOMvariable;
    }


};


})();


var controller = (function(budgetCtrl,UICtrl){

var setupEventListeners = function(){

  var DOM = UICtrl.getDOMvariables();


  document.querySelector(DOM.addbtn).addEventListener('click',ctrlAddItem);

  document.addEventListener('keypress',function(event){
    if(event.keyCode===13 || event.which===13){
      ctrlAddItem();
    }
  });
}

var updateBudget = function(){
  //1. Calculate the Budget
  budgetCtrl.calculateBudget();
  //2.Get the budget
  var budget = budgetCtrl.getBudget();
  //3.update the budgetUI
  UICtrl.displayBudget(budget);
}

 var ctrlAddItem = function(){

   var inputs,newItem;
   //2. Get Input Values
   inputs = UICtrl.getInput();
   //3. Add the new item to our dataStructure
   if(inputs.description !== '' && !isNaN(inputs.value) && inputs.value >0){
    newItem = budgetCtrl.addItem(inputs.type,inputs.description,inputs.value);
   //4.Add the new item to the UI
   UICtrl.addListItem(newItem,inputs.type);
   UICtrl.clearFields();
   //5.Calculate and update the budget
   updateBudget();


 }

 };

 return {
   init: function(){
     console.log("Application has started");
     setupEventListeners();
     UICtrl.displayBudget({
       budget: 0,
       totalInc: 0,
       totalExp: 0,
       percentage: -1
     });
   },
 }


})(budgetController,UIController);

controller.init();
