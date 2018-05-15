import Vue from 'vue'
import Vuex from 'vuex'
import _get from 'lodash.get'
import { buildProductQueryBody, executeQuery } from './query-functions'
import { updateLocalStorage, loadCart, clearCart } from './local-storage'

Vue.use(Vuex)

// Set quantity of a given item in a cart
// (split into separate function so that multiple mutations can use)
const setQuantity = function(state, { variantId, quantity, changeBy }) {
    const index = state.cart.findIndex(i => i.variantId == variantId)

    if (index >= 0) {
        const oldQuantity = state.cart[index].quantity
        const newQuantity =
            changeBy === undefined ? quantity : oldQuantity + changeBy
        state.cart[index].quantity = newQuantity

        state.cartVersion++
        updateLocalStorage(state.cart)
    }
}

export default {
    state: {
        productData: {},
        // load initial cart state from localStorage (defaults to empty array)
        cart: loadCart(),
        // since we can't deep-watch the cart for quantities, etc, we'll
        // watch this value and increment every time the cart is modified
        cartVersion: 0
    },
    mutations: {
        UPDATE_CACHED_RESULT(state, { shopifyId, data }) {
            state.productData[shopifyId] = data
        },
        ADD_TO_CART(state, payload) {
            // check if the variant already exists in the cart
            const index = state.cart.findIndex(
                i => i.variantId == payload.variantId
            )

            if (index >= 0) {
                // if it exists, add 1 to the quantity
                setQuantity(state, {
                    variantId: payload.variantId,
                    changeBy: 1
                })
            } else {
                // if it doesn't exist, push to cart with quantity of 1
                payload.quantity = 1
                state.cart.push(payload)
            }

            // Update storage
            state.cartVersion++
            updateLocalStorage(state.cart)
        },
        SET_QUANTITY(state, { variantId, quantity, changeBy }) {
            // proxy to function declared above
            setQuantity(state, { variantId, quantity, changeBy })
        },
        REMOVE_FROM_CART(state, { variantId }) {
            const index = state.cart.findIndex(i => i.variantId == variantId)

            if (index != -1) {
                state.cart.splice(index, 1)
                state.cartVersion++
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

            // build graphql query
            const query = buildProductQueryBody(shopifyId)
            const result = await executeQuery({ domain, token, query })

            // parse result
            const variants = _get(result, 'data.node.variants.edges', []).map(
                variant => variant.node
            )
            const topLevelData = _get(result, 'data.node', {})

            // add WP info
            const url = `/wp-admin/admin-ajax.php?action=wp_url_from_product_id&product_id=${shopifyId}`
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
