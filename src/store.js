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
        productData: {}
    },
    mutations: {
        UPDATE_CACHED_RESULT(state, { shopifyId, data }) {
            state.productData[shopifyId] = data
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

            // save result
            if (variants.length) {
                commit('UPDATE_CACHED_RESULT', { shopifyId, data: dataToSave })
            }

            // return result from cache to guarantee correct info
            return state.productData[shopifyId]
        }
    }
}
