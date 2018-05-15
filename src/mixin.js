import _get from 'lodash.get'
import { buildCheckoutUrlQueryBody, executeQuery } from './query-functions'
import { loadCart } from './local-storage'

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
            selectedVariantIndex: 0,
            checkoutUrl: ''
        }
    },
    watch: {
        '$store.state.shopify.cartVersion'(newVal) {
            this.updateCheckoutUrl()
        }
    },
    async mounted() {
        if (!this.cmpProductId) {
            return
        }

        // fetch product data on mount - requires product ID
        const shopifyId = this.cmpProductId
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

        this.updateCheckoutUrl()
    },
    computed: {
        cmpProductId() {
            return (
                this.productId ||
                _get(this.$store, 'getters.post.productId', '')
            )
        },
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
                productId: this.cmpProductId,
                title: this.productData.title,
                wp: this.productData.wp,
                quantity
            })
        },
        removeFromCart(evt) {
            this.$store.commit('REMOVE_FROM_CART', this.selectedVariant)
        },
        async getCheckoutUrl(settings) {
            settings = settings || {}

            // load cart
            const cart = loadCart()

            // build query
            const query = buildCheckoutUrlQueryBody(this.storefrontToken, cart)

            // execute query
            const res = await executeQuery({
                domain:
                    settings.domain ||
                    _get(this.$store, 'state.site.shopifyDomain', ''),
                token:
                    settings.token ||
                    _get(this.$store, 'state.site.storefrontToken', ''),
                query
            })

            // get checkout URL or an error
            return _get(res, 'data.checkoutCreate.checkout.webUrl', '#error')
        },
        async updateCheckoutUrl() {
            this.checkoutUrl = await this.getCheckoutUrl()
        }
    }
}
