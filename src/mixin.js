import _get from 'lodash.get'

export default {
    props: {
        productId: {
            type: [String, Number],
            default: ''
        },
        storefrontToken: {
            type: String,
            default: ''
        },
        shopifyDomain: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            shopifyData: null
        }
    },
    async mounted() {
        if (!this.productId) {
            return
        }

        const shopifyId = this.productId
        const token =
            this.storefrontToken ||
            _get(this.$store, 'state.site.storefrontToken', '')
        const domain =
            this.shopifyDomain ||
            _get(this.$store, 'state.site.shopifyDomain', '')

        const data = await this.$shopify.dispatch('GET_PRODUCT_DATA', {
            shopifyId,
            domain,
            token
        })
        this.shopifyData = data
    }
}
