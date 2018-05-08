import Vue from 'vue'
import Vuex from 'vuex'
import _get from 'lodash.get'

Vue.use(Vuex)

const buildProductQueryBody = function(shopifyId) {
    return `
    {
      node(id: "${shopifyId}") {
        id
        ... on Product {
          title
          descriptionHtml
          variants(first: 250) {
            edges {
              node {
                price
                title
                availableForSale
                id
              }
            }
          }
        }
      }
    }
`
}

const executeQuery = async function({ domain, token, query }) {
    return await fetch(`https://${domain}/api/graphql`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/graphql',
            'X-Shopify-Storefront-Access-Token': token
        }),
        body: query
    })
        .then(res => {
            if (!res.ok) {
                throw Error(response.statusText)
            }
            return res.json()
        })
        .catch(e => console.error(e))
}

export default {
    state: {
        productData: {},
        cart: []
    },
    mutations: {
        UPDATE_CACHED_RESULT(state, { shopifyId, data }) {
            state.productData[shopifyId] = data
        },
        ADD_TO_CART(state, { variantId, productId, wpUrl, quantity }) {
            // default to 1 of item
            quantity = quantity || 1
            variantId = variantId || productId

            // cancel if already exists
            if (state.cart.some(item => item.variantId == variantId)) {
                return
            }

            // otherwise, add and set quantity to desired value
            state.cart.push({
                variantId,
                productId,
                wpUrl,
                quantity
            })
        },
        REMOVE_FROM_CART(state, variant) {
            const index = state.cart.findIndex(
                entry => entry.item.id == variant.id
            )
            if (index != -1) {
                state.cart.splice(index, 1)
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
            // // } else if (
            // if (
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

            // add WP ID
            const url =
                location.origin +
                `/wp-admin/admin-ajax.php?action=wp_url_from_product_id&product_id=${shopifyId}`
            const wpUrl = await fetch(url).then(res => res.text())

            // build result
            const dataToSave = {
                variants,
                title: topLevelData.title,
                descriptionHtml: topLevelData.descriptionHtml,
                wpUrl
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
