# vue-proper [![Build Status](https://travis-ci.org/valango/vue-proper.svg?branch=master)](https://travis-ci.org/valango/vue-proper) [![Code coverage](https://codecov.io/gh/valango/vue-proper/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/vue-proper)

Keep [Vue.js](https://vuejs.org/) element attribute definitions aside from
your functional code - similarly as CSS keeps aside HTML styling stuff.

## Problem
[Vue.js](https://vuejs.org/) and awesome [Quasar framework](https://quasar.dev/)
provide super powerful APIs to control component appearance and behavior.
Even [QInput](https://quasar.dev/vue-components/input)
control element has 15 style-related properties out of 47 total!

_**vue-proper**_ makes it easy to manage this complexity.

## Usage
```
$ npm i -S vue-proper
```

Somewhere in application boot code:
```javascript
import Vue from 'vue'

Vue.mixin(require('vue-proper')(require('./ui-settings')))
```
Now, in `my-component.vue`:
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
The `ui-settings.js` file:
```javascript
module.exports = { 
    // Common defaults
    rel: 'noopener',
    target: '_blank',
    // Components with name containing 'round' will have different styling.
    ['/round[^!]*!/']: {
        rounded: true    //  `standout` and `borderless` can be true.
    },
    ['/!failed$/']: {    //  Special styling for failed state.
       color: 'red'
    }
}
```

## How it works
Every time an UI element is (re-)rendered, it's `v-bind=` method gets called.
This happens quite frequently - on content changes, focus changes, etc...

On component creation, the do-nothing `proper()` method will be replaced with
a real thing. Then, on every invocation `this.proper('surname')`
the following sequence will take place:
   1. A **_retrieval key_** `':MyComponent>surname!'` is applied on 
   `ui-definitions.js` contents 
     (see [Retrieval algorithm](#retrieval-algorithm)).
   1. With settings object retrieved, the `ref` property is set to `'surname'` 
   and if `name` property is still not set, it will be `'surname'`, too.
   1. Settings objects is returned by `proper()` method and will be applied
   to UI element.

### Retrieval algorithm
   1. all properties with normal string keys are assigned to result object.
   1. if property key is `RegExpr` definition and the _retrieval key_ matches,
   it's contents will be recursively processed from step #1 on and the result
   be assigned to upper-level result object, overriding conflicting property values.

## API
### Component instance methods
**`proper`**`( param : {string|object}= ) : Object  `
This instance method will replace your original definition, which should be
just an empty function - if it is missing, then vue-proper machinery will not
work with this component.

Usually this method is called with element name as argument and it will return
proper attribute settings. With no name, everything works in the same way,
just `ref` and `name` attributes will not be set.

When called with argument of object type from your code, this method lets
you manipulate inner settings of the plugin instance - see 
[inner settings](#mixin-instance-settings) below.

### Package exports
**`mixin`**`(settings : Object=, namespace : string=) : Object  `
Factory returning mixin definition object.
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

**NB:** exception is thrown, if dictionary is not initialized.

## Advanced topics
Just for clarity: whatever properties are returned by `proper()`, only those
recognized by particular UI element (native or component) will have effect.

**Never** try to modify any parts of settings dictionary - it's
contents should be kept static!

### Mixin instance settings
This chapter will be added soon... sorry!

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
