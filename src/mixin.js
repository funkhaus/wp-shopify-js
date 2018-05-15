import _get from 'lodash.get'

export default {
    props: {
        productId: {
            type: [String, Number],
            default: ''
        },
        shopifyDomain: {
            type: String,
            default: ''
        },
        storefrontToken: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            productData: null,
            selectedVariantIndex: 0
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

        const data = await this.$store.dispatch('GET_PRODUCT_DATA', {
            shopifyId,
            domain,
            token
        })
        this.productData = data
    },
    computed: {
        price() {
            return _get(this.selectedVariant, 'price', '0.00')
        },
        variants() {
            return _get(this.productData, 'variants', [])
        },
        selectedVariant() {
            return _get(this, `variants[${this.selectedVariantIndex}]`, {})
        }
    },
    methods: {
        addToCart(evt, quantity = 1) {
            this.$store.commit('ADD_TO_CART', {
                variantId: this.selectedVariant.id,
                productId: this.productId,
                title: this.productData.title,
                wp: this.productData.wp,
                quantity
            })
        },
        removeFromCart(evt) {
            this.$store.commit('REMOVE_FROM_CART', this.selectedVariant)
        }
    }
}
