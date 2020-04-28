# vue-proper [![Build Status](https://travis-ci.org/valango/vue-proper.svg?branch=master)](https://travis-ci.org/valango/vue-proper) [![Code coverage](https://codecov.io/gh/valango/vue-proper/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/vue-proper)

Keep [Vue.js](https://vuejs.org/) element attribute definitions aside from
component code - like _CSS_ keeps aside the _HTML_ styling stuff.

## Problem
[Vue.js](https://vuejs.org/) and awesome [Quasar framework](https://quasar.dev/)
provide super powerful APIs to control component appearance and behavior.
But using these features often makes your (HTML at the first place) code complex
and hard to manage.

_**vue-proper**_ makes it easy to control this complexity, and more.
To save your time, try the [vue-proper-demo](https://github.com/valango/vue-proper-demo) first!

This package also provides lightweight API for managing texts like UI element
labels, hints, placeholders etc., also with internationalization.

## Usage
```
$ npm i -S vue-proper
```

### Example
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
   be assigned to parent-level result object, overriding conflicting property values.

## API
### Component instance methods
**`proper`**`( param= : {string|object} ) : Object  `
This instance method will replace your original definition, which should be
just an empty function - if it is missing, then component can't use `vue-proper`
services. Injected instance method can be called with:
   * **UI element name**:<br />
   _retrieved_ settings, texts, `{ ref: param, name: param }` and `this.$attrs` 
   will be assigned to returned object in this order.
   * **no arguments**:<br />
   only no-element-specific attributes and contents of `$attrs` are returned.
   This is useful in child components.
   * **object instance**<br />
   [inner settings](#mixin-instance-settings) are overridden by matching properties
   of object instance and clone of original settings object is returned.
   * **null**<br />
   direct reference to [inner settings](#mixin-instance-settings) is
   returned, so it may be manipulated directly.

**`properName`**`() : string  `
If this property method is defined, then it will be called from
`this.proper(elementName)` and returned value is used instead of `name`
internal setting. Example:
```javascript

  methods: { 
    proper: () => undefined, 
    properName () {
      return this.$router.currentRoute.path
    }
  }
```

### Package exports
**`mixin`**`(settings= : Object, namespace= : string) : Object  `
Factory returning mixin definition object.
Namespace defaults to 'proper' and
it affects the names of instance methods. Once the settings objects is provided,
it will be used in following calls.
This method is also default export.

**`set`**`(settings : Object) : Object  `
Assign new settings and return the previous object. Effects already initiated
components, too. This method is called internally on the first call to `mixin()`.

**`retrieve`**`(key= : string) : Object  `
Retrieve the settings. Results are cached internally. Calling this method without
arguments clears the cache.
This method is called internally by `proper()` instance method.
<br>**NB:** exception is thrown, if dictionary is not initialized.

**`texts`**`(field : string, context : string, exact= : boolean) : Object  `
Returns a definition by `<context> "." <field>` or `<field>` just a field itself.
If definition found is an object, then it will be returned unchanged. String value
will be casted to object `{ label: <string-value> }`.
This method is used internally, too by `proper()` instance method.
When called explicitly with _`exact`_ set, then empty object is returned, if
no entry was found in dictionary.

**`texts.get`**`() : Object  `
Returns an internal dictionary inatnce. Mutating it's contents will have immediate effect.

**`texts.set`**`( settings : Object ) : Object  `
Sets an internal dictionary object. Returns internal dictionary instance set.
Mutating that instance has no effect on original `settings` object.

## Advanced topics
Just for clarity: whatever properties are returned by `proper()`, only those
recognized by particular UI element (native or component) will have effect.

**Never** try to modify any parts of settings dictionary - it's
contents should be kept static!

### Mixin instance settings
There are several inner settings you may change:
   * **`compose`**`(el : string, settings : object) : string   ` default 
   implementation returns `<prefix> ":" <name> ">" <el> "!" <suffix>`
   it is not recommended to override this.
   * **`debug`**`(attributes : object, el : string, retrievalKey : string)   `
   is called by just before returning the attributes from `proper()`.
   * **`enhance`**`(attributes : object, el : string)   ` is ha hook enabling to
   change some attributes from component code.
   * **`name`**`: string   ` is set to component name on form creation, but can be changed.
   * **`prefix`**`: string   ` nice place for `vue-router` path or alike.
   * **`suffix`**`: string   ` nice place for status key.
   
### Components wrapping
If parent component had some attributes set it did not recognize, these
will be available via [Vue.js $attrs](https://vuejs.org/v2/api/#vm-attrs)
instance property. Injected `proper()` instance method will check out and
apply those, overriding settings from static dictionary.

### Internationalization
There may be several ways to use [vue-i18n](https://github.com/kazupon/vue-i18n)
or similar packages:
   * translate the static contents of text dictionary once the language selection is made;
   * use traditional $t(field) syntax in html template;
   * call translation API from enhance() hook.

The first option is probably the best.

### UI element lifecycles
This is how Vue.js works - not part of this package, but still good to know. ;)

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
