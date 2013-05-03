stubbyid.js is a simple client-side "simulator" for [Persona][].
It's a drop-in replacement for Persona's `include.js` script.

Persona's [Observer API][] improves end-user sovereignty by allowing users to 
globally log out of all the sites that they're logged into. However, while 
this empowers users, it can make things a bit confusing for developers. That's
why stubbyid.js has a widget at the bottom-right of any page it's included in, 
explaining what the "simulated Persona" service thinks the user wants. It also
logs messages to the console explaining the rationale behind everything it 
does.

This can be used for a variety of purposes, such as:

* Local development, when persona.org is unreachable.
* Writing functional tests in Selenium/WebDriver that abstract away the
  Persona UI.
* Manual testing.
* Personal edification.

For an example of stubbyid.js in use, see the [homepage][].

## Requirements

stubbyid.js has no dependencies. It works with IE8+, and the latest versions
of all major browsers.

## Usage

If you haven't already seen the example on the homepage, you should do
that first to get a feel for the simulator UI that stubbyid.js injects into
every page it's embedded in.

In your app, you'll likely want to somehow conditionally load
stubbyid.js instead of Persona's include script if some kind of
debugging or testing environment variable is set on the server.

Additionally, you'll probably want to conditionally stub out the Persona
verification process on your server too. The "assertion" that stubbyid.js
passes back to your app's `onlogin` handler is simply the 
logged-in user's email address, so your stub verifier should simply
return the assertion as the "verified" email address. (You
could also have certain email addresses simulate a failed verification, if
you want to test that edge case.)

Obviously, this conditional stubbery should never be enabled in
production deployments, as it would allow your users to login as whoever
they wanted.

## API

If you want to use stubbyid.js in an automated way, you can access a
special API available at `navigator.id.stubby`:

**navigator.id.stubby.setPersonaState(state[, notifyWatcher])**

This sets the state of what the Persona simulator believes the user's
login desire to be.

If *state* is `null`, then the Persona simulator believes the user wants
to be logged out. If *state* is an email address, the Persona simulator
believes the user wants to be logged in as that email address.

*notifyWatcher* is a boolean that defaults to `true`. If `true`, then
any `onlogin` or `onlogout` functions passed to `navigator.id.watch` may
be called immediately. If `false`, those functions will not be called; the
page will need to be reloaded (or `navigator.id.watch` called again)
for any login state harmonization to occur.

**navigator.id.stubby.getPersonaState()**

Returns the Persona simulator's belief about the user's desired login
state; `null` if the user wants to be logged out, or an email address
if they want to be logged in.

**navigator.id.stubby.reset()**

Resets the Persona simulator by unsubscribing any functions passed to
`navigator.id.watch` and logging the user out of Persona.

**navigator.id.stubby.onlog**

Setting this property to a function that takes a string argument will
cause it to be called whenever stubbyid.js logs anything to the console.

**navigator.id.stubby.widgetElement**

The DOM element containing the Persona simulator widget.

## Limitations

stubbyid.js only provides an interface for Persona's Observer API. That means
it doesn't provide `navigator.id.get()` or `navigator.id.getVerifiedEmail()`.

  [Persona]: http://persona.org/
  [Observer API]: https://developer.mozilla.org/en-US/docs/DOM/navigator.id
  [homepage]: http://toolness.github.com/stubbyid/
