Template.agentEditGeneral.viewmodel({
  events: {
    "keypress .numberText"(evt){
      var theEvent = evt || window.event;
      var oKey = theEvent.keyCode || theEvent.which;
      var key = String.fromCharCode( oKey );
      var regex = /[0-9]|\.|\-/;
      if(!regex.test(key)) {
        if( oKey != 13){
          theEvent.returnValue = false;
          if(theEvent.preventDefault) theEvent.preventDefault();
        }
      }
    }
  }
});
