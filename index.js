import mixin from './src/mixin'
import store from './src/store'

export default {
    install: function(Vue, options = {}) {
        options = {
            domain: null,
            token: null,
            store: null,
            wordpress: false,

            ...options
        }

        // basic usage warning
        if (!options.domain || !options.token || !options.store) {
            console.error(
                'You need to set the Shopify domain, Shopify token, and Vuex store for wp-shopify to work correctly. No action taken.'
            )
            return
        }

        // make shopify info accessible anywhere
        Vue.prototype.$shopify = options

        // set starting domain and token
        // add module to store
        store.state.domain = options.domain
        store.state.token = options.token
        options.store.registerModule('shopify', store)

        // define mixin
        Vue.mixin(mixin)
    }
}
