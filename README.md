This repo is the Vue plugin for [wp-shopify](https://github.com/funkhaus/wp-shopify), which integrates WordPress, Vue, and Shopify.

With this plugin, you can tap into Shopify as the source of truth for prices, quantities, and more for displaying products on your WordPress + Vue site.

## Installation

1.  Follow the instructions on the [WP plugin](https://github.com/funkhaus/wp-shopify) repo to install on the back-end.
1.  `npm install wp-shopify`
1.  In your main JS file:
    ```
    import WpShopify from 'wp-shopify'
    Vue.use(WpShopify)
    ```
1.  In any component you want to have product data:

    ```
    import { mixin as WpShopify } from 'wp-shopify'

    export default {
        mixins: [ WpShopify ]
    }
    ```

## Usage
