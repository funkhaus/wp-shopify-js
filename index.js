import mixinOptions from './src/mixin'
import storeModule from './src/store'
import buildMixin from './src/build-mixin'
import cache from './src/cache'

export const mixin = mixinOptions

export const store = storeModule

export default {
    install: function(Vue, options = {}) {
        options = {
            domain: null,
            token: null,
            debug: false,
            cache,

            ...options
        }

        // basic usage warning
        if (options.debug && (!options.domain || !options.token)) {
            console.error(
                'You need to set the Shopify domain and token to work correctly.'
            )
        }

        // global properties
        Vue.shopify = options

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
