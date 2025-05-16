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
            // variantId: "${item.variant.id}", // replaced with merchandiseId
            // Do we Need to get variantID as gid://shopify/ProductVariant/15776591708273 => 15776591708273 ?
            merchandiseId: "${item.variant.id}",
            quantity: ${item.quantity} }`
    })

    console.log("line Items: ", lineItems)

    return `
    // mutation {
    //     checkoutCreate(input: {
    //             lineItems: [${lineItems}]
    //         }) {
    //         checkout {
    //             webUrl
    //             subtotalPrice {
    //                 amount
    //             }
    //             id
    //         }
    //     }
    // }
    mutation cartCreate(input: { lines: [${lineItems}] }) {
        cart {
            id
            checkoutUrl
            cost {
                subtotalAmount {
                    amount
                    currencyCode
                }
                totalAmount {
                    amount
                    currencyCode
                }
                totalTaxAmount {
                    amount
                    currencyCode
                }
            }
            totalQuantity
            lines(first: 100) {
                edges {
                    node {
                        id
                        quantity
                        cost {
                            totalAmount {
                                amount
                                currencyCode
                            }
                        }
                        merchandise {
                            ... on ProductVariant {
                                id
                                title
                                selectedOptions {
                                    name
                                    value
                                }
                                product {
                                    id
                                    handle
                                    availableForSale
                                    title
                                    description
                                    descriptionHtml
                                    options {
                                        id
                                        name
                                        values
                                    }
                                    priceRange {
                                        maxVariantPrice {
                                        amount
                                        currencyCode
                                        }
                                        minVariantPrice {
                                        amount
                                        currencyCode
                                        }
                                    }
                                    compareAtPriceRange {
                                        maxVariantPrice {
                                        amount
                                        currencyCode
                                        }
                                    }
                                    variants(first: 250) {
                                        edges {
                                        node {
                                            id
                                            title
                                            availableForSale
                                            selectedOptions {
                                            name
                                            value
                                            }
                                            price {
                                            amount
                                            currencyCode
                                            }
                                            compareAtPrice {
                                            amount
                                            currencyCode
                                            }
                                        }
                                        }
                                    }
                                    featuredImage {
                                        url
                                        altText
                                        width
                                        height
                                    }
                                    images(first: 20) {
                                        edges {
                                        node {
                                            url
                                            altText
                                            width
                                            height
                                        }
                                        }
                                    }
                                    seo {
                                        description
                                        title
                                    }
                                    tags
                                    updatedAt
                                }
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
