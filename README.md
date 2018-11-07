Vue plugin to ease Shopify products and cart management. Can be combined with [WP-Shopify](https://github.com/funkhaus/wp-shopify) for [Vue + WordPress](https://github.com/funkhaus/vuepress).

## Table of Contents

1.  [Installation](#installation)
1.  [Reference](#reference)
    1.  [Mixin](#mixin)
    1.  [Store](#store)

## Installation

If you're combining this plugin with its optional [WordPress backend](https://github.com/funkhaus/wp-shopify), follow the instructions on that repo first.

<details><summary>1.  Set up Shopify.</summary>

1.  Set up a Shopify store and create a new private app.
1.  Go to your Shopify admin panel (your-store.myshopify.com/admin).
1.  Click "Manage Private Apps" at the bottom of the screen. You'll end up on your-store.myshopify.com/admin/apps/private.
1.  Click "Create a new private app."
1.  Keep the default API permissions and make sure `Allow this app to access your storefront data using the Storefront API` at the bottom of the screen is checked.
1.  Hit Save to continue.
1.  Note the Storefront Token on the bottom of the next page:

    [!Image of the Shopify storefront access token location](docs/storefront-access-token.png)

</details>

2.  `npm install wp-shopify`
1.  [Install Vuex](https://vuex.vuejs.org/installation.html).
1.  Before creating your Vue instance, install the plugin with:

    ```js
    import WpShopify from 'wp-shopify'
    import store from 'your-main-vuex-store'

    Vue.use(WpShopify, {
        // your Shopify domain, formatted: my-site.myshopify.com
        // (Vuepress default shown)
        domain: jsonData.site.shopifyDomain,
        // your Shopify storefront access token
        // (Vuepress default shown)
        token: jsonData.site.storefrontToken,
        store: store, // your Vuex store
        wordpress: true // whether or not to include WordPress data - default false
    })
    ```

That's it! You've got full access to the store module, mixin, and instance variables below.

## Product Templating

If you know the ID of your product, you can retrieve the full object with `getProduct`:

```html
<template>

    <section>
        {{ product }}
    </section>

</template>

<script>
export default {
    mounted() {
        // this is how the WordPress plugin retrieves a product...
        const productId = this.$store.getters.post.productId

        // ...but any valid ID will work
        this.product = this.getProduct(productId)
    }
}
</script>
```

You can also pass the ID as a prop:

`ProductExample.vue`

```html
<template>

    <div class="product-example">
        {{ product }}
    </div>

</template>
```

`Main.vue`

```html
<template>

    <product-example :product-id="'your product ID here'"/>

</template>
```

## TODO: Update this section

1.  **Use in product lists or detail pages:**

    A single `wps-product` page might look like this:

    ```html
    <template>

        <main>

            <h2>{{ $store.getters.post.title }}</h2>

            <select v-model="selectedVariantIndex">
                <option
                    v-for="(variant, i) in variants"
                    :key="i"
                    :value="i">

                    {{ variant.title }}

                </option>
            </select>

            <button @click="addToCart">Add to Cart</button>

        </main>

    </template>

    <script>
    import { mixin } from 'wp-shopify'

    export default {
        mixins: [mixin]
    }

    </script>
    ```

    And an annotated version of the above:

    ```html
    <template>

        <main>

            <!-- Static data like title, images, and body content are stored in WordPress -->
            <h2>{{ $store.getters.post.title }}</h2>

            <!-- `selectedVariantIndex` is an int that keeps track of the variant the user has selected -->
            <select v-model="selectedVariantIndex">

                <!-- Each variant (stored in `variants`) is pulled from Shopify -->
                <option
                    v-for="(variant, i) in variants"
                    :key="i"
                    :value="i">

                    {{ variant.title }}

                </option>
            </select>

            <!-- `addToCart` adds one of the selected variant to the cart, incrementing the value if it already exists -->
            <button @click="addToCart">Add to Cart</button>

        </main>

    </template>

    <script>
    import { mixin } from 'wp-shopify'

    export default {
        // Using the wp-shopify `mixin` will give you access to the data and functions described above
        mixins: [mixin]
    }

    </script>
    ```

1.  **Use in carts:**
    A shopping cart might look like this:

    ```html
    <template>
        <div class="shopping-cart">
            <ul>

                <li v-for="(product, i) in $store.state.shopify.cart" :key="i">
                    <span>{{ product.title }}</span>
                    <span>({{ product.quantity }})</span>
                </li>

            </ul>

            <a :href="checkoutUrl" target="_blank" rel="noopener noreferrer">Checkout</a>
        </div>
    </template>

    <script>
    import { mixin } from 'wp-shopify'

    export default {
        mixins: [mixin]
    }

    </script>
    ```

    Annotated:

    ```html
    <template>
        <div class="shopping-cart">
            <ul>

                <!-- This assumes you're keeping the wp-shopify store in a module called `shopify` on your main store, creating the value `$store.state.shopify` -->
                <li v-for="(product, i) in $store.state.shopify.cart" :key="i">
                    <span>{{ product.title }}</span>
                    <span>({{ product.quantity }})</span>
                </li>

            </ul>

            <!-- The checkout URL is automatically updated any time the cart changes -->
            <a :href="checkoutUrl" target="_blank" rel="noopener noreferrer">Checkout</a>
        </div>
    </template>

    <script>
    import { mixin } from 'wp-shopify'

    export default {
        mixins: [mixin]
    }

    </script>
    ```

## Reference

### Mixin

Any component with the wp-shopify mixin gets the following properties:

-   **Props**
    Note that you don't need to set these in most instances - if you're using Vuepress, they'll be populated already. You can override any of the Vuepress defaults with the props below.

    -   `productId` - String or Number, default pulled from `$store`
        Shopify product ID. For a single product, use:

        `<single-product :product-id="$store.getters.post.productId"/>`

        For a product archive, use:

        `<single-product v-for="(product, i)" :key="i" :product-id="product.productId"/>`

        The `productId` will be used for both the query to Shopify as well as the key for caching product data.

-   **Data**

    -   `productData` - default `null`
        Data fetched from Shopify and WordPress for this product. `null` if none received yet (or if a rejection is received). Otherwise an object with the following properties:

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
        descriptionHtml: '',

        // Information pulled from WordPress
        wp: {
            // Relative path to this product's page
            path: '/products/product-name',
            // Serialized Rest-Easy attachment for this product's featured image
            featuredAttachment: Object
        }
        ```

    -   `selectedVariantIndex` - default `0`
        Variant currently selected by the user.

    -   `checkoutUrl` - default empty string
        URL to Shopify checkout. Automatically updated whenever the cart is updated.

    -   `checkoutSubtotal` - default empty string
        Checkout subtotal, not including taxes or shipping.

    -   `domain`- String, default pulled from `$store`
        Domain of the Shopify store. The backend usually sets this automatically, so most of the time you don't need to worry about it.

    -   `token` - String, default pulled from `$store`
        Storefront Token for the Shopify store. The backend usually sets this automatically, so most of the time you don't need to worry about it.

*   **Mounted**

    The mixin's `mounted` function takes care of fetching a product's data from Shopify using the provided ID, Shopify domain, and Storefront token.

    It dispatches the `GET_PRODUCT_DATA` action on the WP-Shopify store, which does the following:

    1.  Checks for the product ID in the local cache. Returns cached value if found.
    1.  Builds and executes a GraphQL query for the desired product.
    1.  Caches and returns the parsed result of the query.

*   **Methods**

    -   `addToCart(event, quantity = 1)`
        Add a given quantity of the currently selected variant to the cart.

    -   `removeFromCart()`
        Remove all of the given variant from the cart

    -   `async getCheckoutUrl({})`
        Get the Shopify checkout URL from the given cart. Accepts one object as an argument that can have `domain` and `token` values, though these are automatically populated by wp-shopify. You shouldn't need to call this in most cases - the checkout URL is available in `data` and modified each time the cart is modified.

    -   `async updateCheckoutUrl()`
        Update the `checkoutUrl` of this instance. You shouldn't need to call this in most cases - the checkout URL is available in `data` and modified each time the cart is modified.

    -   `async getProduct(id)`
        Get product info for a given Shopify ID and save in the cache.

### Store

#### State

wp-shopify's `store.state` consists of:

-   `productData`: Object, default empty
    Cache of all product data retrieved from Shopify. You shouldn't need to access this directly in most cases.

-   `cart`: Array, default empty
    Current Shopify cart. Contains an array of products in the following format:

    ```js
    {
        productId: 'String, Shopify product ID',
        quantity: 1,
        title: 'String, product title',
        variantId: 'String, Shopify variant ID',
        // WordPress information
        wp: {
            // rest-easy serialized featured image
            featuredAttachment: {},
            path: '/relative/path/to/product'
        }
    }
    ```

-   `cartVersion`: Int, default 0
    Version of the Shopify cart. Since we can't watch the cart for nested values like quantity, this value is incremented every time the cart is modified.

#### Mutations

You can `commit` any of the following mutations:

-   `UPDATE_CACHED_RESULT`

    You shouldn't need to use this in most cases - wp-shopify will handle its own product data cache.

    ```js
    this.$store.commit('UPDATE_CACHED_RESULT', {
        shopifyId: // string - ID of Shopify product
        data: // anything - new data to cache for give Shopify product
    })
    ```

-   `ADD_TO_CART`

    Add a single instance of a given product variant to the user's cart.

    ```js
    this.$store.commit('ADD_TO_CART', {
        variantId: // string - ID of Shopify product variant
    })
    ```

-   `SET_QUANTITY`

    Set the quantity for a given product variant in the user's cart. Either change to a new value completely or add/subtract a given number.

    Requires either `quantity` for the former or `changeBy` for the latter.

    ```js
    this.$store.commit('SET_QUANTITY', {
        variantId: // string - ID of Shopify product variant
        quantity: // int, optional - new quantity
        changeBy: // int, optional - change existing quantity by this number
    })
    ```

-   `REMOVE_FROM_CART`

    Removes a given variant from the cart.

    ```js
    this.$store.commit('REMOVE_FROM_CART', {
        variantId: // string - ID of Shopify product variant
    })
    ```

#### Actions

You can `dispatch` any of the following actions:

-   `GET_PRODUCT_DATA`

    Retrieve cached product data or, if no data exist yet, fetch from Shopify and store in cache.

    Usually it's better to call `getProduct(id)` from the mixin, since it handles `domain` and `token` automatically.

    ```js
    const productData = await this.$store.dispatch('GET_PRODUCT_DATA', {
        shopifyId: // string - ID of Shopify product
        domain: // string - domain of Shopify store
        token: // string - Storefront API token
    })
    ```
