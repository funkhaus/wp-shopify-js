# WP-Shopify

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
        // your Shopify domain, formatted: 'my-site.myshopify.com'
        // (default shown uses jsonData var from Vuepress)
        domain: jsonData.site.shopifyDomain,
        // your Shopify storefront access token
        // (default shown uses jsonData var from Vuepress)
        token: jsonData.site.storefrontToken,
        store: store, // your Vuex store
        wordpress: true // whether or not to include WordPress data - default false
    })
    ```

That's it! You've got full access to the store module, mixin, and instance variables below.

See the [docs site](/) for more information.
