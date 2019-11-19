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

## The Mixin

The plugin automatically adds the following mixin data on all components:

```js
{
    props: {
        productId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            selectedVariantIndex: 0,
            product: null
        }
    },
    async mounted(){
        /*
        The mounted function checks to see if the `productId` prop is set.
        If it is, mounted() sets `this.product` to the result of `this.getProduct(this.productId)`.
        */
    },
    methods: {
        async getProduct(id){
            /*
            `getProduct` fetches and returns the product with the given ID from Shopify.
            First, it checks the cached data in `$store.state.shopify.productData[id]`;
            if nothing is found, it builds and executes a query for the product data from Shopify, caching the result.
            */
        },
        async getVariant(variant, product){
            /*
            TODO
            */
        },
        addToCart(product){
            /*
            TODO
            */
        }
    },
    computed: {
        selectedVariant(){
            /*
            Returns either the currently selected variant or,
            if none is selected or no product is present, null.
            */
        }
    }

}
```

## Product Data

Data fetched with `getProduct` is formatted like this:

```js
{
    // Shopify ID (base64-encoded string from Shopify)
    id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzk1NTIzMjI1NjAzNg==',

    // Shopify title
    title: 'My Product',

    // Shopify description as raw HTML
    descriptionHtml: '',

    // List of variants
    variants: [
        {
            // Price for this variant
            price: '30.00',
            
            // Compare to sale price for this variant
            compareAtPrice: '30.00',

            // Variant title
            title: 'Small',

            // Whether or not this variant is available
            availableForSale: true,

            // Variant ID
            id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC85NDE3NTIzMzMxMTA4'
        }
    ],

    // If `wordpress` was set to `true` when installing plugin:
    wp: {
        // relative path to this product in WordPress
        path: '/store/sample-product/'
    }
}
```

## Store Module

WP-Shopify adds a module called `shopify` to the Vuex store with the following state, mutations, and actions:

```js
state: {
    // Cache for fetched product data
    productData: {},

    // load initial cart state from localStorage (defaults to empty array)
    cart: loadCart(),

    // domain and token (set in installation)
    domain: '',
    token: '',

    // since we can't deep-watch the cart for quantities, etc, the store
    // watches this value and increment every time the cart is modified
    // (this is for internal use only)
    cartVersion: 0,

    // checkout URL as calculated from cart contents
    checkoutUrl: '',

    // subtotal of all items in cart
    subtotal: ''
},
mutations: {
    UPDATE_CACHED_RESULT({ shopifyId, data }) {
        /*
        Updates `state.productData` entry for `shopifyId` with new `data`
        */
    },
    ADD_TO_CART({ variant, quantity }) {
        /*
        Adds `quantity` (default 1) of the given `variant` to the cart.
        Updates localstorage and the checkout URL.
        */
    },
    SET_QUANTITY({ variant, quantity, changeBy }) {
        /*
        Either set the `variant` to a specific `quantity` or change its current
        `quantity` by `changeBy` units. Updates localstorage and the checkout URL.
        */
    },
    REMOVE_FROM_CART({ variant }) {
        /*
        Removes all of a given `variant` from the cart.
        Updates localstorage and the checkout URL.
        */
    },
    EMPTY_CART() {
        /*
        Removes everything from the cart.
        Updates localstorage and the checkout URL.
        */

    },
    UPDATE_CHECKOUT() {
        /*
        Manually refresh the checkout URL. Usually called internally.
        */
    },
    SET_DOMAIN_AND_TOKEN({ domain, token, force }) {
        /*
        Update the Shopify domain and token.
        Set `force` to `true` to update even if a Shopify domain and token already exist.
        */
    }
},
actions: {
    async GET_PRODUCT_DATA(
        { shopifyId, domain, token }
    ) {
        /*
        Fetch and cache a product's data given its ID.
        Should not be called manually - use `getProduct` from the mixin instead.
        */
    }
}
```

## Product Templating

### Basic Templating

All of a product's Shopify data is contained in the product object. If you know the ID of your product, you can retrieve the full object with `getProduct`.

```html
<template>

    <section>
        {{ product ? product.title : '' }}
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

You can also pass the ID as a prop called `product-id` to automatically fetch a product on a custom component:

`Main.vue`

```html
<template>

    <product-example :product-id="'your product ID here'"/>

</template>
```

`ProductExample.vue`

```html
<template>

    <div class="product-example">
        {{ product ? product.title : '' }}
    </div>

</template>
```

### Variants

A product usually has at least one variant - different colors, sizes, etc. - that you'll need to account for.

The easiest way to handle this is to use the built-in `selectedVariant` system. For example:

```html
<template>

    <h2 v-if="!product">Loading...</h2>

    <main v-else>

        <h2>{{ product.title }}</h2>

        <h3>Currently selected: {{ selectedVariant.title }} (${{ selectedVariant.price }})</h3>

        <select v-model="selectedVariantIndex">
            <option
                v-for="(variant, i) in variants"
                :key="i"
                :value="i">

                {{ variant.title }}

            </option>
        </select>

        <button @click="addToCart()">
            Add to Cart
        </button>

    </main>

</template>
```

And an annotated version of the above:

````html
```html
<template>

    <!-- Product loading state -->
    <h2 v-if="!product">Loading...</h2>

    <!-- Product loaded and ready -->
    <main v-else>

        <h2>{{ product.title }}</h2>

        <h3>Currently selected: {{ selectedVariant.title }} (${{ selectedVariant.price }})</h3>

        <!-- Changing the selectedVariantIndex changes the selectedVariant -->
        <select v-model="selectedVariantIndex">
            <option
                v-for="(variant, i) in variants"
                :key="i"
                :value="i">

                {{ variant.title }}

            </option>
        </select>

        <!-- addToCart is another function from the mixin -->
        <button @click="addToCart()">
            Add to Cart
        </button>

    </main>

</template>
````

### Cart

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
```

Annotated:

```html
<template>
    <div class="shopping-cart">
        <ul>

            <!-- Shopify data is kept in a Vuex module called 'shopify' -->
            <li v-for="(product, i) in $store.state.shopify.cart" :key="i">
                <span>{{ product.title }}</span>
                <span>({{ product.quantity }})</span>
            </li>

        </ul>

        <!-- The checkout URL is automatically updated any time the cart changes -->
        <a :href="checkoutUrl" target="_blank" rel="noopener noreferrer">Checkout</a>
    </div>
</template>
```
