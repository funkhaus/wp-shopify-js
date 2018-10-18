import { buildProductQueryBody, executeQuery } from './query-functions'
import _get from 'lodash/get'
import cache from './cache'

export default options => {
    return {
        props: {
            productId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                selectedVariantIndex: 0,
                fetchedProduct: null
            }
        },
        methods: {
            async getProduct(id) {
                let output = cache[id]

                if (!cache[id]) {
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
                    parsedResult.variants = _get(
                        parsedResult,
                        'variants.edges',
                        []
                    )
                        .map(variant => variant.node || null)
                        .filter(variant => variant)

                    // save the result
                    this.fetchedProduct = output = cache[id] = parsedResult
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
            }
        },
        computed: {
            selectedVariant() {
                return this.fetchedProduct
                    ? _get(
                          this.fetchedProduct,
                          `variants[${this.selectedVariantIndex}]`
                      )
                    : null
            }
        }
    }
}
