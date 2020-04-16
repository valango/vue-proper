# vue-proper

Maintain Vue.js component static props thru central repository.

**Warning:** This package is not published yet and dramatic changes may happen to it.

Vue.js and related Quasar framework provide super powerful API to control
component appearance and behavior. But it often results in unpleasantly bloated
template code like this:
```html
<template>
  <q-select dense :disable="disable" :error="error" fill-input
            hide-bottom-space
            :hide-dropdown-icon="hideDropdownIcon" hide-selected
            input-debounce="100" options-dense outlined
            no-error-icon :placeholder="placeholder" ref="me" use-input
            v-model="current" :options="list" @filter="filterFn"
            @focusin.native="focusIn" @focusout.native="focusOut">
    <template v-slot:no-option>
      <q-item v-if="noResults">
        <q-item-section class="text-grey">No results</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
```
And this is just a simple text input field... come on! Instead, I would like:
```html
        <q-input @focus="at(2)" :disable="isWeightless" :error="errs[2]"
                 label="mass" ref="mass" v-model="mass"></q-input>
```
and
```javascript
const props = require('vue-proper')('.MyComponent')

export default {
  props: require('vue-proper')('.MyComponent.inThisCase', {
      options: {type: Array, required: true}
    }),
  //  Rest of component definition.
}
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

This is a simple component:
```html
<template>
  <q-select @filter="filterFn" @focusin.native="focusIn" v-bind="$proper('select1')">
  </q-select>
</template>
```
```javascript
export default {
  $properTag: 'MyComponent',
}
```
Unless `$proper()` method is already defined in `methods` section,
it will be created and bound to _component instance_ during initiation.
The `$properTag` will be bound to it.

See [Vue.js custom directives](https://vuejs.org/v2/guide/custom-directive.html)

#Lifecycle
1. Component initalization
   * `beforeMount` hook
   * `v-bind` directives of all elements
   * `v-model` directives of all elements
   * `bind` of user-defined directives
   * `inserted` of user-defined directives
   * possible auto-focus
   * `mounted` hook
1. Component update
   * `v-bind` directives of all elements
   * `inserted` of user-defined directives on all elements

## API
//  In boot module - namespace defaults to 'proper'
//  vueProper instance will be namespaced after this
Vue.mixin(require('vue-proper')(settingsObject, namespace))


//  Individually
import vueProper from 'vue-proper'

//  In specific cases ... this will not change `vueProper` name spacing
  mixins: [require('vue-proper')(myNamespace)]

Great news is: props values can ve also set via parent element v-bind!
