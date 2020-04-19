# vue-proper

Maintain Vue.js component static props thru central repository.

## Problem
[Vue.js](https://vuejs.org/) and awesome [Quasar framework](https://quasar.dev/)
provide super powerful APIs to control component appearance and behavior.
Even [QInput](https://quasar.dev/vue-components/input)
control element has 15 style-related properties out of 47 total!

Would you like to keep boilerplate property definitions separate from your
functional code - similarly as HTML styling is kept in CSS, SASS, SCSS, etc...?

_**vue-proper**_ makes it easy to do this and more.

## Usage

Somewhere in application boot code:
```javascript
import Vue from 'vue'
import defaults from '../ui-definitions'

Vue.mixin(require('vue-proper')(defaults))
```
Now, in `some-component.vue`:
```html
<template>
      <some-element v-bind="proper('name')" v-model="name">
      </some-element>
</template>
```
```javascript
export default {
  methods: {
    //  API of vue-proper package.
    proper: () => undefined    
  }
}
```
Are we missing something here? Oh, yes - the `ui-definitions.js` file:
```javascript
export default {
     // Common defaults
     outlined: true,    //  Used by Quasar
     useInput: true,    //  Will map to `use-input` property, if element has such.
     // Some parts of UI use different styling.
     ['/smooth/']: {
       outlined: false, //  Quasar stuff - only one of `filled`, `outlined`,
       rounded: true    //  `standout` and `borderless` can be true.
     },
     ['/\@failed$/']: {   //  Some state-related styling here.
       color: 'red'
     }
}
```
Now, all elements in html template will have `outlined` and `use-input` properties
set to _true_ if applicable, except in component `MySmoothInput.vue` where 
`rounded` and `use-input` will be _true_ instead.

## How it works

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
