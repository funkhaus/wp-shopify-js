import _get from 'lodash.get'

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

// Checkout URL query builder
export const buildCheckoutUrlQueryBody = function(shopifyId, cart) {
    const lineItems = cart.map(item => {
        return `{ variantId: "${item.variantId}", quantity: ${item.quantity} }`
    })

    return `
    mutation {
        checkoutCreate(input: {
                lineItems: [${lineItems}]
            }) {
            checkout {
                webUrl
            }
        }
    }
    `
}

// Generic query executor
export const executeQuery = async function({ domain, token, query }) {
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
