This repo is the Vue plugin for [wp-shopify](https://github.com/funkhaus/wp-shopify), which integrates WordPress, Vue, and Shopify.

With this plugin, you can tap into Shopify as the source of truth for prices, quantities, and more for displaying products on your WordPress + Vue site.

## Installation

1.  Follow the instructions on the [WP plugin](https://github.com/funkhaus/wp-shopify) repo to install on the back-end.
1.  `npm install wp-shopify`
1.  In your main JS file:
    ```js
    import WpShopify from 'wp-shopify'
    Vue.use(WpShopify)
    ```
1.  In any component you want to have wp-shopify data or actions:

    ```js
    import { mixin as WpShopify } from 'wp-shopify'

    export default {
        mixins: [WpShopify]
    }
    ```

## Usage

A single product's Vue template might look like this:

```html
<template>
    <main class="product">
        <h2>{{ shopifyData.title }}</h2>
        <h3>${{ selectedVariant.price }}</h3>

        <select v-model="selectedVariantIndex">
            <option
                v-for="(variant, i) in shopifyData.variants"
                :key="i"
                :value="i">
                {{ variant.title }}
            </option>
        </select>

    </main>
</template>

<script>
import { mixin as WpShopify } from 'wp-shopify'

export default {
    mixins: [ WpShopify ],
    data(){
        return {
            selectedVariantIndex: 0
        }
    },
    computed: {
        selectedVariant(){
            return this.shopifyData.variants[this.selectedVariantIndex]
        }
    }
}
</script>
```

A few things to note:

1.  Static data like the product title and description HTML live directly in `shopifyData`.
1.  You'll need to compute data for some fields. For example, the price depends on your currently selected product variant.

## Reference

### Store

Once the plugin is activated with `Vue.use(WpShopify)`, any component has access to `this.$shopify`, a Vuex store with cached product data and options available.

TODO: Document store API

### Mixin

Any component with the wp-shopify mixin gets the following properties:

*   **Props**

    *   `productId` - String or Number, default empty
        Shopify product ID. For a single product, use:

        `<single-product :product-id="$store.getters.post.productId"/>`

        For a product archive, use:

        `<single-product v-for="(product, i)" :key="i" :product-id="product.productId"/>`

        The `productId` will be used for both the query to Shopify as well as the key for caching product data.

    *   `shopifyDomain`- String, default empty
        Domain of the Shopify store. The backend usually sets this automatically, so most of the time you don't need to worry about it.

    *   `storefrontToken` - String, default empty
        Storefront Token for the Shopify store. The backend usually sets this automatically, so most of the time you don't need to worry about it.

*   **Data**

    *   `shopifyData` - default `null`
        Data fetched from Shopify for this product. `null` if none received yet (or if a rejection is received). Otherwise an object with the following properties:

        ```js
        // All product variants
        variants: [
            // Single variant example
            {
                // Whether or not this product is available for sale
                availableForSale: true,
                // Price padded to two decimal places
                price: '5.00',
                // Variant title
                title: 'green / large'
            }
        ],

        // The product title
        title: 'T-Shirt Example',

        // Description HTML - available, but recommended to use WordPress content for faster load times
        descriptionHtml: ''
        ```

*   **Mounted**

    WP-Shopify's `mounted` function takes care of fetching a product's data from Shopify using the provided ID, Shopify domain, and Storefront token.

    It dispatches the `GET_PRODUCT_DATA` action on the WP-Shopify store, which does the following:

    1.  Checks for the product ID in the local cache. Returns cached value if found.
    1.  Builds and executes a GraphQL query for the desired product.
    1.  Caches and returns the parsed result of the query.
