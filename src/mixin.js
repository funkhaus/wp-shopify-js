import {
    buildProductQueryBody,
    executeQuery,
    buildCheckoutUrlQueryBody
} from './query-functions'
import { loadCart } from './local-storage'
import _get from 'lodash/get'

export default {
    props: {
        productId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            selectedVariantIndex: 0,
            product: null,
            cartVersion: 0,
            checkoutUrl: '',
            checkoutSubtotal: ''
        }
    },
    async mounted() {
        if (this.productId) {
            await this.getProduct(this.productId)
            this.updateCheckout()
        }
    },
    methods: {
        async getProduct(id) {
            let output = null
            // TODO: check store

            if (!output) {
                // build query to find a product
                const query = buildProductQueryBody(id)

                // execute that query
                const result = await executeQuery({
                    domain: this.$shopify.domain,
                    token: this.$shopify.token,
                    query
                })

                // parse the result
                const parsedResult = _get(result, 'data.node', false)

                if (!parsedResult) {
                    return null
                }

                // extra parsing on the variants
                parsedResult.variants = _get(parsedResult, 'variants.edges', [])
                    .map(variant => variant.node || null)
                    .filter(variant => variant)

                // save the result
                this.product = output = parsedResult
            }

            return output
        },
        async getVariant(variant, product) {
            if (product == null) {
                product = this.productId
            }

            const productId = (await this.getProduct(
                product && product.id ? product.id : product
            )).id

            const fetchedProduct = await this.getProduct(productId)

            return fetchedProduct.variants[variant]
        },
        addToCart() {
            this.$store.commit('ADD_TO_CART', {
                ...this.product,
                variant: {
                    ...this.selectedVariant
                }
            })
        },
        async getCheckoutInfo() {
            // build query
            const query = buildCheckoutUrlQueryBody(
                this.$shopify.token,
                this.$store.state.shopify.cart
            )

            // execute query
            const res = await executeQuery({
                domain: this.$shopify.domain,
                token: this.$shopify.token,
                query
            })

            console.log(res)

            // get checkout URL or an error
            return {
                url: _get(res, 'data.checkoutCreate.checkout.webUrl', '#error'),
                subtotal: _get(
                    res,
                    'data.checkoutCreate.checkout.subtotalPrice',
                    '#error'
                )
            }
        },
        async updateCheckout() {
            const updatedCheckout = await this.getCheckoutInfo()
            this.checkoutUrl = updatedCheckout.url
            this.checkoutSubtotal = updatedCheckout.subtotal
        }
    },
    computed: {
        selectedVariant() {
            return this.product
                ? _get(this.product, `variants[${this.selectedVariantIndex}]`)
                : null
        }
    },
    watch: {
        '$store.state.shopify.cartVersion'(newVal) {
            this.updateCheckout()
        }
    }
}
