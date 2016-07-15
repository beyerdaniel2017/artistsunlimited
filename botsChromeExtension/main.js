$("body").prepend("<div style='width:100%; height:100px; background-color:gray; position:absolute; top:200px; z-index:5000;'> <button id='one'> One </button> <button id='two'> Two </button> <button id='three'> Three </button> </div>")

$('#one').on('click', function(event) {
  //click signup button
  document.getElementsByClassName('g-opacity-transition sc-button sc-button-medium signupButton sc-button-cta')[0].click();
  //fill in email
  document.getElementsByClassName("textfield__input sc-input sc-input-large")[0].value = "balh6323@gmail.co";
  //add event listener for keypress for m in .com
  document.getElementsByClassName('textfield__input sc-input sc-input-large')[0].addEventListener('keypress', function() {
    //add click event to check email
    document.getElementsByClassName('signinForm__cta sc-button-cta sc-button sc-button-large')[0].click();
    setTimeout(function() {
      //wait for next screen to load then fill in password
      document.getElementsByClassName('textfield__input sc-input sc-input-large')[2].value = makeid();
      //keypress
      document.getElementsByClassName('textfield__input sc-input sc-input-large')[2].addEventListener('keypress', function() {
        //fill in age
        document.getElementsByClassName('textfield__input sc-input sc-input-large')[3].value = (Math.floor(Math.random() * 3) + 2);
        getElementsByClassName('textfield__input sc-input sc-input-large')[3].focus();
        //wait for last digit of age
        document.getElementsByClassName('textfield__input sc-input sc-input-large')[2].addEventListener('keypress', function() {
          //check checkbox
          document.getElementsByClassName('sc-checkbox-input sc-visuallyhidden')[0].click();
          //click sign in
          document.getElementsByClassName('signinForm__cta sc-button-cta sc-button sc-button-large')[2].click();
          setTimeout(function() {
            //make username
            document.getElementsByClassName('textfield__input sc-input sc-input-large')[4].value = makeid;
            //wait for last letter of username press
            document.getElementsByClassName('textfield__input sc-input sc-input-large')[4].addEventListener('keypress', function() {
              //select gender
              document.getElementsByClassName('select__select sc-select sc-select-large')[0].value = (Math.random() < 0.5) ? 'female' : 'male';
              //click exit
              document.getElementsByClassName('signinForm__cta sc-button-cta sc-button sc-button-large')[6].click();
            })
          })
        }, 1000)
      })
    })
  }, 1000);
})


function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 7; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function makeAge() {

}