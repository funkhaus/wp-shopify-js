import _get from 'lodash/get'

// Single product query builder
export const buildProductQueryBody = function(shopifyId) {
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
                price {
                    amount
                }
                title
                availableForSale
                id
                compareAtPrice {
                    amount
                }
              }
            }
          }
        }
      }
    }
`
}

// Checkout URL query builder
export const buildCheckoutUrlQueryBody = function(shopifyId, cart) {
    const lineItems = cart.map(item => {
        return `{
            variantId: "${item.variant.id}",
            quantity: ${item.quantity} }`
    })

    return `
    mutation {
        checkoutCreate(input: {
                lineItems: [${lineItems}]
            }) {
            checkout {
                webUrl
                subtotalPrice {
                    amount
                }
                id
            }
        }
    }
    `
}

// Checkout URL query builder
export const getCheckoutStatusQueryBody = function(cartId) {
    return `
    query {
        node(id: "${cartId}") {
            ... on Checkout {
                id
                completedAt
            }
        }
    }
    `
}

// Generic query executor
export const executeQuery = async function({ domain, token, query }) {
    return await fetch(`https://${domain}/api/2024-04/graphql.json`, {
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
