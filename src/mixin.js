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
            product: null
        }
    },
    async mounted() {
        if (this.productId) {
            await this.getProduct(this.productId)
        }

        if (
            !this.$store.state.shopify.domain ||
            !this.$store.state.shopify.token
        ) {
            this.$store.commit('SET_DOMAIN_AND_TOKEN', {
                domain: this.$shopify.domain,
                token: this.$shopify.token
            })
        }
    },
    methods: {
        async getProduct(id) {
            let output = _get(
                this,
                `$store.state.shopify.productData[${id}]`,
                false
            )

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

                // add WP info
                let wp = null
                if (this.$shopify.wordpress) {
                    const url = `/wp-admin/admin-ajax.php?action=wp_url_from_product_id&product_id=${id}`
                    wp = await fetch(url, {
                        credentials: 'same-origin'
                    }).then(res => res.json())

                    parsedResult['wp'] = {
                        path: wp.relativePath,
                        featuredAttachment: wp.featuredAttachment
                    }
                }

                // save result
                this.$store.commit('UPDATE_CACHED_RESULT', {
                    shopifyId: id,
                    data: parsedResult
                })

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
        }
    },
    computed: {
        selectedVariant() {
            return this.product
                ? _get(this.product, `variants[${this.selectedVariantIndex}]`)
                : null
        }
    }
}
