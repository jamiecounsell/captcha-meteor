window.VisualCaptcha = {};

Template.captcha.selectedWord = function() { 
  return Session.get("selectedWord");
};

Template.captcha.images = function() {
  return Session.get("captchaImages");
}

Template.statusMessage.msg = function() {
  return Session.get("statusMessage");
}


Template.captcha.created = function(){
  var SERVER = window.location.origin;
  var urls = {
    start: SERVER + "/captcha/start/5"
  }
  var imageName = "";
  $.get(urls.start, function(res) {
    var jsonResp = JSON.parse(res);
    var images = [];
    Session.set("selectedWord", jsonResp.imageName);
    jsonResp.values.forEach(function(val, idx) {
      images.push({idx: idx, val: val});
    })
    Session.set("captchaImages", images);
  });
}
Template.captcha.rendered = function(){
  var captchaEl = $( '#visual-captcha' ).visualCaptcha({
          imgPath: '/packages/captcha/images/img/',
          captcha: {
              url: window.location.origin,
              numberOfImages: 5
          }
      } );
      VisualCaptcha.captcha = captchaEl.data( 'captcha' );
      
      var queryString = window.location.search;
      // Show success/error messages
      
}

VisualCaptcha.validateCaptcha = function(callback){
  var data = VisualCaptcha.captcha.getCaptchaData();
  Meteor.call("validateCaptcha",data, function(err,result){
    if(!err){
      if ( result === 'noCaptcha') {
        Session.set("statusMessage", { valid: "", css: "icon-no", text: "Uh oh! Something went wrong. Please try again." } );
      } else if ( result === 'validImage'){
          Session.set("statusMessage", { valid: "valid",css: "icon-yes", text: "Thanks! We're good to go." } );
          callback()
      } else if ( result ==='failedImage'){
          Session.set("statusMessage", { valid: "",css: "icon-no", text: "Uh oh! You picked the wrong one. Are you a robot?" } );
      } else if ( result === 'validAudio'){
          Session.set("statusMessage", { valid: "valid",css: "icon-yes", text: "Thanks! We're good to go." } );
          callback();
      } else if ( result === 'failedAudio'){
          Session.set("statusMessage", { valid: "",css: "icon-no", text: "Uh oh, that's not right. Are you a robot?" } );
      } else if ( result === 'failedPost'){
          Session.set("statusMessage", { valid: "",css: "icon-no", text: "Please choose one or click the speaker to listen." } );
      }
      if (Session.get("statusMessage").valid != "valid"){
        VisualCaptcha.captcha.refresh()        
      }
    }
    
  });
}