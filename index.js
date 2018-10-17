import mixinOptions from './src/mixin'
import storeModule from './src/store'

export const mixin = mixinOptions

export const store = storeModule

export default {
    install: function(Vue, options = {}) {
        options = {
            domain: null,
            token: null,
            debug: false,

            ...options
        }

        if (options.debug && (!options.domain || !options.token)) {
            console.error(
                'You need to set the Shopify domain and token to work correctly.'
            )
        }

        // Add shopify data to all components
        Vue.mixin({
            data() {
                return {
                    shopify: {
                        domain: options.domain,
                        token: options.token
                    }
                }
            }
        })

        // TODO: Start here
    }
}
