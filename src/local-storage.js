const storageKey = 'wps-cart'

export const updateLocalStorage = function(cartJson) {
    localStorage.setItem(storageKey, JSON.stringify(cartJson))
}

export const loadCart = function() {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
        return JSON.parse(stored)
    }

    return []
}

export const clearCart = function() {
    localStorage.removeItem(storageKey)
}
