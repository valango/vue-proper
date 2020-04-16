# vue-proper

Maintain Vue.js component static props thru central repository.

**Warning:** This package is not published yet and dramatic changes may happen to it.

Vue.js and related Quasar framework provide super powerful API to control
component appearance and behavior. But it often results in unpleasantly bloated
template code like this:

```html
        <q-input @focus="at(2)" dense :disable="isWeightless"
                 :error="errs[2]" hide-bottom-space
                 label="mass" :no-error-icon="noErrorIcon"
                 outlined ref="mass" v-model="mass"></q-input>
```
Come on - and this is just a simple text input field! I would like this instead:

```html
        <q-input @focus="at(2)" :disable="isWeightless" :error="errs[2]"
                 label="mass" ref="mass" v-model="mass"></q-input>
```
This code is more readable and maintainable! Also, keeping static property
definitions separately would be essentially the same thing as using CSS instead
of HTML `style="myriade: of-horrible-definitions"`.

The central repository would be a static dictionary something like this:
```javascript
    {
       $MySlowDataComponent: {
          $WithDetailedDiagnostics: {
                   hideBottomSpace: false,
                   noErrorIcon: false
          },
          inputDebounce: '1000'   //  Give user time to enjoy the animations.
       },
       // Generic defaults for any context.
       dense: true,
       hideBottomSpace: true,
       inputDebounce: '100',
       noErrorIcon: true
       outlined: true
    }
```
