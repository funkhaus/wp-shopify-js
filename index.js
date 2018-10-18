import mixinOptions from './src/mixin'
import buildMixin from './src/build-mixin'
import cache from './src/cache'
import cart from './src/cart'

export const mixin = mixinOptions

export default {
    install: function(Vue, options = {}) {
        options = {
            domain: null,
            token: null,
            debug: false,
            cache,
            cart,

            ...options
        }

        // basic usage warning
        if (options.debug && (!options.domain || !options.token)) {
            console.error(
                'You need to set the Shopify domain and token to work correctly.'
            )
        }

        // make shopify info accessible anywhere
        Vue.prototype.$shopify = options

        // Define mixin
        Vue.mixin(
            buildMixin({
                vueInstance: Vue,
                ...options
            })
        )

        // TODO: Start here
    }
}
