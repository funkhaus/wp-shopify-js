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
            checkoutUrl: '',
            checkoutSubtotal: '',
            token: '',
            domain: ''
        }
    },
    watch: {
        '$store.state.shopify.cartVersion'(newVal) {
            this.updateCheckout()
        }
    },
    async mounted() {
        return
        this.token =
            this.storefrontToken ||
            _get(this.$store, 'state.site.storefrontToken', false)
        this.domain =
            this.shopifyDomain ||
            _get(this.$store, 'state.site.shopifyDomain', '')

        if (this.cmpProductId) {
            // fetch product data on mount - requires product ID
            const shopifyId = this.cmpProductId

            const data = await this.$store.dispatch('GET_PRODUCT_DATA', {
                shopifyId,
                domain: this.domain,
                token: this.token
            })
            this.productData = data
        }

        this.updateCheckout()
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
                quantity,
                selectedVariant: this.selectedVariant
            })
        },
        removeFromCart(evt) {
            this.$store.commit('REMOVE_FROM_CART', this.selectedVariant)
        },
        async getCheckoutInfo(settings) {
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
        },
        async getProduct(id) {
            const result = await this.$store.dispatch('GET_PRODUCT_DATA', {
                shopifyId: id,
                domain: this.domain,
                token: this.token
            })
            return result
        }
    }
}
