//=============================================================================
// MMO_LoginForm.js
//=============================================================================

/*:
 * @plugindesc Login form
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {
  function LoginForm() {
      this.initialize.apply(this, arguments);
  }

  LoginForm.prototype = Object.create(Scene_Base.prototype);
  LoginForm.prototype.constructor = LoginForm;

  LoginForm.prototype.initialize = function() {
      Scene_Base.prototype.initialize.call(this);
  };

  LoginForm.prototype.reBindInput = function() {
    Input.initialize();
  }

  LoginForm.prototype.create = function() {
      Scene_Base.prototype.create.call(this);
      this.createBackground();
      this.createForeground();
      // this.createWindowLayer();
      // this.createCommandWindow();
  };

  LoginForm.prototype.start = function() {
      Scene_Base.prototype.start.call(this);
      SceneManager.clearStack();
      this.centerSprite(this._backSprite1);
      this.centerSprite(this._backSprite2);
      this.playTitleMusic();
      this.startFadeIn(this.fadeSpeed(), false);
      this.createLoginForm();
  };

  LoginForm.prototype.update = function() {
      Scene_Base.prototype.update.call(this);
  };

  LoginForm.prototype.isBusy = function() {
      return Scene_Base.prototype.isBusy.call(this);
  };

  LoginForm.prototype.terminate = function() {
      Scene_Base.prototype.terminate.call(this);
      SceneManager.snapForBackground();
  };

  LoginForm.prototype.createLoginForm = function() {
    $("#ErrorPrinter").append(
      '<div id="LoginForm" class="panel panel-primary" style="width:'+(Graphics.boxWidth - (Graphics.boxWidth / 3))+'px">'+
        '<div class="panel-heading">Login</div>'+
        '<div class="panel-body">'+
          '<div id="loginErrBox"></div>'+
          '<div class="input-group">'+
            '<span class="input-group-addon" id="username-addon"><i class="fa fa-user"></i></span>'+
            '<input type="text" class="form-control login-input" id="inputUsername" placeholder="Username" aria-describedby="username-addon">'+
          '</div><br>'+
          '<div class="input-group">'+
            '<span class="input-group-addon" id="password-addon"><i class="fa fa-lock"></i></span>'+
            '<input type="password" class="form-control login-input" id="inputPassword" placeholder="Password" aria-describedby="password-addon">'+
          '</div><br>'+
          '<button id="btnConnect" class="btn btn-primary">Connect</button>'+
        '</div>'+
      '</div>');

    //Bind commands
    var that = this;
    $(".login-input").keypress(function(e){
      if (e.which == 13) { //enter
        that.connectAttempt();
      }; 
    })
    $("#btnConnect").click(function(){that.connectAttempt()})
  }

  LoginForm.prototype.displayError = function(msg) {
    $("#loginErrBox").html('<div class="alert alert-danger fade in">'+msg+'</div>')
  }

  LoginForm.prototype.displayInfo = function(msg) {
    $("#loginErrBox").html('<div class="alert alert-info fade in">'+msg+'</div>')
  }

  LoginForm.prototype.connectAttempt = function(){
    var that = this;
    var username = $("#inputUsername").val();
    var password = $("#inputPassword").val();

    if (username.length == 0)
      return this.displayError("You must provide a username!");
    if (password.length == 0)
      return this.displayError("You must provide a password!");

    shapwd = CryptoJS.SHA1(password+'d28cb767c4272d8ab91000283c67747cb2ef7cd1').toString(CryptoJS.enc.Hex);
    this.displayInfo('Connecting <i class="fa fa-spin fa-spinner"></i>');
    $network.on("loginResponse", function(data){
      if (data.err)
        return that.displayError("Error : "+data.err);
      if (data.msg && data.msg == username) {
        $("#ErrorPrinter").fadeOut({duration: 1000}).html("");
        that.fadeOutAll();
          SceneManager.goto(Scene_Map);
        return that.displayInfo("Ok : "+data.msg);
      }
    });
    $network.emit("loginQuery", {
      username: username,
      password: shapwd
    });
  }

  LoginForm.prototype.createBackground = function() {
      this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
      this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
      this.addChild(this._backSprite1);
      this.addChild(this._backSprite2);
  };

  LoginForm.prototype.createForeground = function() {
      this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
      this.addChild(this._gameTitleSprite);
      if ($dataSystem.optDrawTitle) {
          this.drawGameTitle();
      }
  };

  LoginForm.prototype.drawGameTitle = function() {
      var x = 20;
      var y = Graphics.height / 4;
      var maxWidth = Graphics.width - x * 2;
      var text = $dataSystem.gameTitle;
      this._gameTitleSprite.bitmap.outlineColor = 'black';
      this._gameTitleSprite.bitmap.outlineWidth = 8;
      this._gameTitleSprite.bitmap.fontSize = 72;
      this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
  };

  LoginForm.prototype.centerSprite = function(sprite) {
      sprite.x = Graphics.width / 2;
      sprite.y = Graphics.height / 2;
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
  };

  LoginForm.prototype.playTitleMusic = function() {
      AudioManager.playBgm($dataSystem.titleBgm);
      AudioManager.stopBgs();
      AudioManager.stopMe();
  };

  // Overwriting the Title screen to display the login form
  Scene_Title.prototype.start = function() {
      Scene_Base.prototype.start.call(this);
      SceneManager.clearStack();
      SceneManager.goto(LoginForm);
  };
})();