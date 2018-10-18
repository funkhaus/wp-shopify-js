import Vue from 'vue'
import Vuex from 'vuex'
import _get from 'lodash/get'
import {
    buildProductQueryBody,
    executeQuery,
    buildCheckoutUrlQueryBody
} from './query-functions'
import { updateLocalStorage, loadCart, clearCart } from './local-storage'

Vue.use(Vuex)

// Set quantity of a given item in a cart
// (split into separate function so that multiple mutations can use)
const setQuantity = function(state, { variant, quantity, changeBy }) {
    const index = state.cart.findIndex(i => i.variant.id == variant.id)

    if (index >= 0) {
        const oldQuantity = state.cart[index].quantity
        const newQuantity =
            changeBy === undefined ? quantity : oldQuantity + changeBy
        state.cart[index].quantity = newQuantity

        // remove if <= 0
        if (newQuantity <= 0) {
            state.cart.splice(index, 1)
        }

        state.cartVersion++
        updateLocalStorage(state.cart)
    }
}

// Rebuild checkout URL and subtotal
// (split into separate function so that multiple mutations can use)
const updateCheckout = async function(state) {
    // build query
    const query = buildCheckoutUrlQueryBody(state.token, state.cart)

    // execute query
    const res = await executeQuery({
        domain: state.domain,
        token: state.token,
        query
    })

    // get checkout URL or an error
    state.checkoutUrl = _get(
        res,
        'data.checkoutCreate.checkout.webUrl',
        '#error'
    )
    state.subtotal = _get(
        res,
        'data.checkoutCreate.checkout.subtotalPrice',
        '#error'
    )
}

export default {
    state: {
        productData: {},
        // load initial cart state from localStorage (defaults to empty array)
        cart: loadCart(),
        domain: '',
        token: '',
        // since we can't deep-watch the cart for quantities, etc, we'll
        // watch this value and increment every time the cart is modified
        cartVersion: 0,
        checkoutUrl: '',
        subtotal: ''
    },
    mutations: {
        UPDATE_CACHED_RESULT(state, { shopifyId, data }) {
            state.productData[shopifyId] = data
        },
        ADD_TO_CART(state, payload) {
            // check if the variant already exists in the cart
            const index = state.cart.findIndex(
                i => i.variant.id == payload.variant.id
            )

            if (index >= 0) {
                // if it exists, add 1 to the quantity
                setQuantity(state, {
                    variant: payload.variant,
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
            // Update checkout
            updateCheckout(state)
        },
        SET_QUANTITY(state, { variant, quantity, changeBy }) {
            // proxy to function declared above
            setQuantity(state, { variant, quantity, changeBy })
            // Update checkout
            updateCheckout(state)
        },
        REMOVE_FROM_CART(state, { variant }) {
            const index = state.cart.findIndex(i => i.variant.id == variant.id)

            if (index != -1) {
                state.cart.splice(index, 1)
                state.cartVersion++
                updateLocalStorage(state.cart)
                // Update checkout
                updateCheckout(state)
            }
        },
        EMPTY_CART(state) {
            state.cart = []
            state.cartVersion++
            // Update checkout
            updateCheckout(state)
        },
        UPDATE_CHECKOUT(state) {
            updateCheckout(state)
        },
        SET_DOMAIN_AND_TOKEN(state, { domain, token, force }) {
            if (!state.domain || force) {
                state.domain = domain
            }
            if (!state.token || force) {
                state.token = token
            }

            updateCheckout(state)
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

            // build result
            const dataToSave = {
                variants,
                title: topLevelData.title,
                descriptionHtml: topLevelData.descriptionHtml
            }

            commit('UPDATE_CACHED_RESULT', { shopifyId, data: dataToSave })

            // return result from cache to guarantee correct info
            return state.productData[shopifyId]
        }
    }
}
