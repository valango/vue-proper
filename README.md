# vue-proper [![Build Status](https://travis-ci.org/valango/vue-proper.svg?branch=master)](https://travis-ci.org/valango/vue-proper) [![Code coverage](https://codecov.io/gh/valango/vue-proper/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/vue-proper)

Maintain Vue.js component static props thru central repository.

**NB:** This package is not yet properly tested and may be changed a lot!

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
Now, in `SomeComponent.vue`:
```html
<template>
      <some-element v-bind="proper('surname')" v-model="surname" />
</template>
```
```javascript
export default {
  methods: {
    //  Injection point for vue-proper API.
    proper: () => undefined    
  }
}
```
The `ui-definitions.js` file:
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
Every time an UI element is (re-)rendered, it's `v-bind=` method gets called.
This happens quite frequently - on content changes, focus changes, etc...

On component creation, the do-nothing `proper()` method will be replaced with
a real thing. Then, on every invocation `this.proper('surname')`
the following sequence will take place:
   1. `this.properKey('surname')` is called, which by default results in
    string `SomeComponent.name`, used as **_retrieval key_** on `ui-definitions` 
    contents (see [Retrieval algorithm](#retrieval-algorithm)).
   1. With settings object retrieved, the `ref` property is set to `'surname'` 
   and if `name` property is still not set, it will be `'surname'`, too.
   1. `this.properAdd(settings)` is called, which just returns it's argument
   unchanged by default.
   1. Settings objects is returned by `proper()` method and will be applied
   to UI element.

### Retrieval algorithm
   1. all properties with normal string keys are assigned to result object.
   1. if property key is RegExpr definition and the _retrieval key_ matches,
   it's contents will be recursively processed from step #1 on and the result
   be assigned to upper-level result object, overriding conflicting property values.

## API
### Component instance methods
**`proper`**`( elementName : string= ) : Object  `
If this instance method is not defined, then our component will not be
supported by services described above and nothing will be injected to it's code.

If the method returns undefined, then it will be replaced with default method
during element creation. Otherwise, it will be left as it is.

**HINT:** If you want to wrap the native method in your own,
use `v-bind="myMethod(...)"` in component template.

**`properKey`**`( elementName : string=, componentName : string= ) : String  `
Should generate proper retrieval key. You can use Vue router path, state variables
or whatever you like. Default code injected will just concatenate component
and element names using '.' as separator.

**`properFinal`**`( settings : Object ) : Object  `
Finalizes the settings object. Default version does nothing. It is possible
to set dynamic properties here instead of using things like `:error-message="eMsg"`
in component's html template.

### Package exports
**`mixin`**`(settings : Object=, namespace : string=) : Object  `
Factory returning mixin definition object. If settings are not provided at
the first call, then exception will be thrown (not correct!).
Namespace defaults to 'proper' and
it affects the names of instance methods. Once the settings objects is provided,
it will be used in following calls.
This method is also default export.

**`set`**`(settings : Object) : Object  `
Assign new settings and return the previous object. Effects already initiated
components, too. This method is called internally on the first call to `mixin()`.

**`retrieve`**`(key : string=) : Object  `
Retrieve the settings. Results are cached internally. Calling this method without
arguments clears the cache.
This method is called internally by `proper()` instance method.

## Advanced topics
Just for clarity: whatever properties are returned by `proper()`, only those
recognized by particular UI element (native or component) will have effect.

**Never** try to modify any parts of settings dictionary - it's
contents should be kept static!
### Dynamic properties
Because `properFinal()` is instance method, it can change any settings. So
instead of common pattern of `:element-property="someReactiveProperty"`
you may just assign it programmatically thus probably getting rid of some
computed property. Both options have their _pros_ and _cons_.
### Components wrapping
If parent component had some attributes set it did not recognize, these
will be available via [Vue.js $attrs](https://vuejs.org/v2/api/#vm-attrs)
instance property. Injected `proper()` instance method will check out and
apply those, overriding settings from static dictionary.
### Lifecycles
This is how Vue.js works - not part of this package, but still good know. ;)

1. Component initalization
   * `beforeMount` hook
   * `v-bind` directives on all elements
   * `v-model` directives on all elements
   * `bind` of user-defined directives
   * `inserted` of user-defined directives
   * possible auto-focus
   * `mounted` hook
1. Component update
   * `v-bind` directives on all elements
   * `inserted` of user-defined directives on all elements

See [Vue.js custom directives](https://vuejs.org/v2/guide/custom-directive.html)
