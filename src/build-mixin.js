import { buildProductQueryBody, executeQuery } from './query-functions'
import _get from 'lodash/get'
import cache from './cache'

export default options => {
    return {
        // data() {
        //     return {
        //         shopify: {
        //             domain: options.domain,
        //             token: options.token
        //         }
        //     }
        // },
        methods: {
            async getProduct(id) {
                let output = cache[id]

                if (!cache[id]) {
                    // build query to find a product
                    const query = buildProductQueryBody(id)

                    // execute that query
                    const result = await executeQuery({
                        domain: options.vueInstance.shopify.domain,
                        token: options.vueInstance.shopify.token,
                        query
                    })

                    // parse the result
                    const parsedResult = _get(result, 'data.node', false)

                    // extra parsing on the variants
                    parsedResult.variants = _get(
                        parsedResult,
                        'variants.edges',
                        []
                    )
                        .map(variant => variant.node || null)
                        .filter(variant => variant)

                    // save the result
                    cache[id] = parsedResult
                    // and save the output
                    output = parsedResult
                }

                return output
            }
        }
    }
}
