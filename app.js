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
  this.percentage = -1;
}

Expense.prototype.calcPercentage = function(totalIncome){
  if(totalIncome>0){
    this.percentage = Math.round((this.value/totalIncome)*100);
  }else{
    this.percentage = -1;
  }
};

Expense.prototype.getPercentage = function(){
  return this.percentage;
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

  deleteItem: function(type,id){
    var index,idArr;

    idArr = data.allItems[type].map(function(current){
      return current.id;
    });

    index = idArr.indexOf(id);

    if (index !== -1){
      data.allItems[type].splice(index,1);
    }


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

  calculatePercentages: function(){

    data.allItems.exp.forEach(function(cur){
      cur.calcPercentage(data.total.inc);
    });
  },

  getBudget: function(){
      return {
        budget:data.budget,
        percentage:data.percentage,
        totalExp:data.total.exp,
        totalInc:data.total.inc,
      }
  },

  getPercentages: function(){

    var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
    })
    return allPerc;
  },


  testing: function(){
    console.log(data);
  }

}

})();

var UIController = (function(){

  var html,newHtml,DOMvariable,nodeListForEach;

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
    expensesPercLabel : '.item__percentage',
    monthLabel: '.budget__title--month',
    container: '.container',
  };

  nodeListForEach = function(list,callback){
    for(var i=0;i<list.length;i++){
        callback(list[i],i);
    }
  };

  formatNumber = function(num,type){
    var numArray,intPart,decPart;

    num = Math.abs(num);
    num = num.toFixed(2);
    numArray = num.split('.');
    intPart = numArray[0];
    decPart = numArray[1];

    if(intPart.length>3){
      intPart = intPart.substr(0,intPart.length-3)+','+intPart.substr(intPart.length-3,3);
    }
    else if(intPart.length>6){
      intPart = intPart.substr(0,intPart.length-6)+','+intPart.substr(intPart.length-6,3)+','+intPart.substr(intPart.length-3,3);
    }

    return (type==='exp' ? '-': '+') + ' ' + intPart + '.' + decPart;
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
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }else if(type==='exp'){
        element = DOMvariable.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      newHtml = html.replace('%id%',obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

      document.querySelector(element).insertAdjacentHTML('afterbegin',newHtml);

    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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
      var type;
      obj.budget>0 ? type='inc' : type='exp';

      document.querySelector(DOMvariable.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMvariable.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
      document.querySelector(DOMvariable.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

      if(obj.percentage>0){
        document.querySelector(DOMvariable.percentageLabel).textContent = obj.percentage + '%';
      }else{
        document.querySelector(DOMvariable.percentageLabel).textContent = '---';
      }
    },

    getDOMvariables: function(){
      return DOMvariable;
    },

    displayPercentages: function(percentages){

      var fields = document.querySelectorAll(DOMvariable.expensesPercLabel);

      nodeListForEach(fields,function(current,index){
        if(percentages[index]>0){
          current.textContent = percentages[(percentages.length-1)-index] + '%';
        }else{
          current.textContent = '---'
        }
      })
    },

    displayMonth: function(){
      var now,year,month;

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMvariable.monthLabel).textContent = months[month] + ',' + year;

    },

    changedType: function(){

      var fields = document.querySelectorAll(
        DOMvariable.inputType + ',' +
        DOMvariable.inputDescription + ',' +
        DOMvariable.inputValue
      );

      nodeListForEach(fields,function(current){
        current.classList.toggle('red-focus');
      });

      // document.querySelector(DOMvariable.addBtn).classList.toggle('red');
    }

}


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

  document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
  document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

};




var updateBudget = function(){
  //1. Calculate the Budget
  budgetCtrl.calculateBudget();
  //2.Get the budget
  var budget = budgetCtrl.getBudget();
  //3.update the budgetUI
  UICtrl.displayBudget(budget);
};

var updatePercentage = function(){
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
};


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
   //6.Calculate and update the percentages
   updatePercentage();
 }

 };

 var ctrlDeleteItem = function(event){
   var itemID,splitID,type,id;

   itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

   if(itemID){
     splitID = itemID.split('-');
     type = splitID[0];
     id = parseInt(splitID[1]);
     //1.delete the item for dataStructure
     budgetCtrl.deleteItem(type,id);
     //2.delete the item from the UI
     UICtrl.deleteListItem(itemID);
     //3. recalculate the budget and update the ui
     updateBudget();
     updatePercentage();
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
     UICtrl.displayMonth();
   },
 }


})(budgetController,UIController);

controller.init();
