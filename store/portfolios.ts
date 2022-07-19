import { defineStore } from 'pinia'

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const usePortfolios = defineStore('portfolios', {
    state: () => {
        return {
            portfolios: null as (Object[] | null)
        }
    },

    getters: {
        getPortfolio: (state) => {
            type Portfolio = { // This just satisfies the editor when picking the transaction.portfolio_id below
                [key: string]: any
            }
            return (portfolioId) => {
                if (state.portfolios)
                    return state.portfolios.find((p: Portfolio) => p.portfolio_id === portfolioId)
                else
                    return null
            }
        }
    },
})