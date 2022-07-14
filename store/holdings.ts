import { defineStore } from 'pinia'

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useHoldings = defineStore('holdings', {
    state: () => {
        return {
            holdings: null as (Object[] | null)
        }
    },

    getters: {
        getHoldings: (state) => {
            type Holding = { // This just satisfies the editor when picking the holding.portfolio_id below
                [key: string]: any
            }
            return (portfolioId) => {
                if (state.holdings)
                    return state.holdings.filter((holding: Holding) => holding.portfolio_id === portfolioId)
                else
                    return null
            }
        }
    },

    actions: {
        replaceHoldings(portfolioId, newHoldings) {
            if (this.holdings) {
                this.holdings = this.holdings.filter(holding => holding.portfolio_id !== portfolioId)
                this.holdings.push(...newHoldings)
            } else {
                this.holdings = newHoldings
            }
        },

        updateHolding(holdingId, newPortfolio) {
            this.holdings = this.holdings.map(h => {
                if (h.holding_id === holdingId) {
                    h.portfolio_id = newPortfolio
                }
                return h
            })
        },

        deleteHolding(holdingId) {
            this.holdings = this.holdings.filter(h => h.holding_id !== holdingId)
        }
    }
})