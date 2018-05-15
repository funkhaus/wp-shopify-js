import Vue from 'vue'
import Vuex from 'vuex'
import _get from 'lodash.get'
import { buildProductQueryBody, executeQuery } from './query-functions'
import { updateLocalStorage, loadCart, clearCart } from './local-storage'

Vue.use(Vuex)

const setQuantity = function(state, { variantId, quantity, changeBy }) {
    const index = state.cart.findIndex(i => i.variantId == variantId)

    if (index >= 0) {
        const oldQuantity = state.cart[index].quantity
        const newQuantity =
            changeBy === undefined ? quantity : oldQuantity + changeBy
        state.cart[index].quantity = newQuantity

        updateLocalStorage(state.cart)
    }
}

export default {
    state: {
        productData: {},
        cart: loadCart()
    },
    mutations: {
        UPDATE_CACHED_RESULT(state, { shopifyId, data }) {
            state.productData[shopifyId] = data
        },
        ADD_TO_CART(state, payload) {
            const index = state.cart.findIndex(
                i => i.variantId == payload.variantId
            )
            if (index >= 0) {
                setQuantity(state, {
                    variantId: payload.variantId,
                    changeBy: 1
                })
            } else {
                payload.quantity = 1
                state.cart.push(payload)
            }

            // Update storage
            updateLocalStorage(state.cart)
        },
        SET_QUANTITY(state, { variantId, quantity, changeBy }) {
            setQuantity(state, { variantId, quantity, changeBy })
        },
        REMOVE_FROM_CART(state, { variantId }) {
            const index = state.cart.findIndex(i => i.variantId == variantId)

            if (index != -1) {
                state.cart.splice(index, 1)
                updateLocalStorage(state.cart)
            }
        }
    },
    actions: {
        async GET_PRODUCT_DATA(
            { state, commit },
            { shopifyId, domain, token }
        ) {
            // are we already in the cache? return if so
            if (state.productData[shopifyId]) {
                return state.productData[shopifyId]
            }
            // TODO: implement checking for cached variants
            // } else if (
            //     Object.keys(state.productData)
            //         .map(key => {
            //             const product = state.productData[key]
            //             return false
            //         })
            //         .some(res => res)
            // ) {
            // }

            // build graphql query
            const query = buildProductQueryBody(shopifyId)
            const result = await executeQuery({ domain, token, query })

            // parse result
            const variants = _get(result, 'data.node.variants.edges', []).map(
                variant => variant.node
            )
            const topLevelData = _get(result, 'data.node', {})

            // add WP info
            const url =
                location.origin +
                `/wp-admin/admin-ajax.php?action=wp_url_from_product_id&product_id=${shopifyId}`
            const wp = await fetch(url).then(res => res.json())

            // build result
            const dataToSave = {
                variants,
                title: topLevelData.title,
                descriptionHtml: topLevelData.descriptionHtml,
                wp: {
                    path: wp.relativePath,
                    featuredAttachment: wp.featuredAttachment
                }
            }

            // save result
            if (variants.length) {
                commit('UPDATE_CACHED_RESULT', { shopifyId, data: dataToSave })
            }

            // return result from cache to guarantee correct info
            return state.productData[shopifyId]
        }
    }
}
