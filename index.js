import mixinOptions from './src/mixin'
import store from './src/store'
import Vuex from 'vuex'

export default {
    install(Vue, options = {}) {
        Vue.prototype.$shopify = new Vuex.Store(store)
    }
}

export const mixin = mixinOptions
