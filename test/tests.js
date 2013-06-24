onload = function() {
  var log = [];
  var stubby = navigator.id.stubby;
  var widget = stubby.widgetElement;

  // window.prompt isn't a function in IE8, which makes sinon complain.
  if (typeof(window.prompt) != "function") window.prompt = function() {};

  widget.style.display = "none";
  stubby.onlog = function(msg) { log.push(msg); };
  module("stubbyid", {
    setup: function() {
      stubby.reset();
      log = [];
    },
    teardown: function() {
    }
  });

  test("loggedInUser=null, personaState=null", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState(null);
    navigator.id.watch({
      loggedInUser: null,
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 0);
    equal(onlogout.callCount, 0);
    deepEqual(log, ["Client thinks the user is logged out " +
                    "and they want to be, so doing nothing."]);
  });

  test("loggedInUser=foo@example, personaState=foo@example", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState("foo@example.com");
    navigator.id.watch({
      loggedInUser: "foo@example.com",
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 0);
    equal(onlogout.callCount, 0);
    deepEqual(log, ["Client thinks the user is logged in as " +
                    "foo@example.com and they want to be, so doing " +
                    "nothing."]);
  });

  test("loggedInUser=foo@example, personaState=null", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState(null);
    navigator.id.watch({
      loggedInUser: "foo@example.com",
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 0);
    equal(onlogout.callCount, 1);
    deepEqual(log, ["Client thinks the user is logged in as " +
                    "foo@example.com but they want to be logged out.",
                    "Calling onlogout()."]);
  });

  test("loggedInUser=undefined, personaState=null", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState(null);
    navigator.id.watch({
      loggedInUser: undefined,
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 0);
    equal(onlogout.callCount, 1);
    deepEqual(log, ["Client doesn't know if user is logged in " +
                    "or not and they want to be logged out. ",
                    "Calling onlogout()."]);
  });

  test("loggedInUser=null, personaState=foo@example", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState("foo@example.com");
    navigator.id.watch({
      loggedInUser: null,
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 1);
    ok(onlogin.calledWith("foo@example.com"));
    equal(onlogout.callCount, 0);
    deepEqual(log, ["Client thinks the user is logged out but " +
                    "they want to be logged in as foo@example.com.",
                    "Calling onlogin()."]);
  });

  test("loggedInUser=undefined, personaState=foo@example", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState("foo@example.com");
    navigator.id.watch({
      loggedInUser: undefined,
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 1);
    ok(onlogin.calledWith("foo@example.com"));
    equal(onlogout.callCount, 0);
    deepEqual(log, ["Client doesn't know if user is logged in " +
                    "or not and they want to be logged in as " +
                    "foo@example.com.",
                    "Calling onlogin()."]);
  });

  test("loggedInUser=bar@example, personaState=foo@example", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState("foo@example.com");
    navigator.id.watch({
      loggedInUser: "bar@example.com",
      onlogin: onlogin,
      onlogout: onlogout
    });
    equal(onlogin.callCount, 1);
    ok(onlogin.calledWith("foo@example.com"));
    equal(onlogout.callCount, 0);
    deepEqual(log, ["Client thinks the user is logged in as " +
                    "bar@example.com but they want to be logged in as " +
                    "foo@example.com.",
                    "Calling onlogin()."]);
  });

  test("widget works when persona state is logged in", function() {
    stubby.setPersonaState("b<script>alert('e');</script>'");
    ok(widget.innerHTML.indexOf("b&lt;script&gt;alert('e')") != -1);
    ok(widget.innerHTML.indexOf("logout") != -1);
    widget.querySelector("button").click();
    ok(widget.innerHTML.indexOf("logout") == -1);
    equal(stubby.getPersonaState(), null);
  });

  test("widget works when persona state is logged out", function() {
    stubby.setPersonaState(null);
    ok(widget.innerHTML.indexOf("login") != -1);
    sinon.stub(window, "prompt", function(prompt) {
      return "lol@cat.org";
    });
    widget.querySelector("button").click();
    ok(window.prompt.calledOnce);
    window.prompt.restore();
    ok(widget.innerHTML.indexOf("login") == -1);
    equal(stubby.getPersonaState(), "lol@cat.org");
  });

  test("navigator.id.request() calls oncancel if needed", function() {
    var opts = {oncancel: sinon.spy()};
    var promptRes;
    stubby.setPersonaState(null);
    navigator.id.watch({
      loggedInUser: null,
      onlogin: function() {},
      onlogout: function() {}
    });
    sinon.stub(window, "prompt", function(prompt) { return promptRes; });
    promptRes = "foo@example.com";
    navigator.id.request(opts);
    equal(opts.oncancel.callCount, 0);
    promptRes = null;
    navigator.id.request(opts);
    ok(opts.oncancel.calledOnce);
    window.prompt.restore();
  });

  test("navigator.id.request() works", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState(null);
    navigator.id.watch({
      loggedInUser: null,
      onlogin: onlogin,
      onlogout: onlogout
    });
    sinon.stub(window, "prompt", function(prompt) {
      return "lol@cat.org";
    });
    navigator.id.request();
    ok(window.prompt.calledOnce);
    window.prompt.restore();
    equal(onlogin.callCount, 1);
    ok(onlogin.calledWith("lol@cat.org"));
    equal(onlogout.callCount, 0);
    ok(widget.innerHTML.indexOf("login") == -1);
    equal(stubby.getPersonaState(), "lol@cat.org");    
  });

  test("navigator.id.logout() works", function() {
    var onlogin = sinon.spy();
    var onlogout = sinon.spy();
    stubby.setPersonaState("lol@cat.org");
    navigator.id.watch({
      loggedInUser: "lol@cat.org",
      onlogin: onlogin,
      onlogout: onlogout
    });
    navigator.id.logout();
    equal(onlogin.callCount, 0);
    equal(onlogout.callCount, 1);
    ok(widget.innerHTML.indexOf("login") != -1);
    equal(stubby.getPersonaState(), null);
  });

  test("navigator.id.get() asks for email", function() {
    var gotAssertion = sinon.spy();
    sinon.stub(window, "prompt", function(prompt) {
      return "lol@cat.org";
    });
    sinon.stub(window, "setTimeout");

    try {
      navigator.id.get(gotAssertion);

      equal(window.prompt.callCount, 1);
      equal(window.setTimeout.callCount, 1);
      equal(window.setTimeout.firstCall.args[1], 1);
      equal(gotAssertion.callCount, 0);

      // Simulate the triggering of the timeout.
      window.setTimeout.firstCall.args[0]();

      equal(gotAssertion.callCount, 1);
      deepEqual(gotAssertion.firstCall.args, ["lol@cat.org"]);
      equal(stubby.getPersonaState(), null,
            "persona state should not be changed after navigator.id.get()");
    } finally {
      window.setTimeout.restore();
      window.prompt.restore();
    }
  });

  test("navigator.id.getVerifiedEmail() is same as .get()", function() {
    equal(navigator.id.get, navigator.id.getVerifiedEmail);
  });
};
