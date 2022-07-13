import { defineStore } from 'pinia'

export const useTransactions = defineStore('transactions', {
    state: () => {
        return {
            transactions: null as (Object[] | null)
        }
    },

    getters: {
        getTransactions: (state) => {
            type Transaction = { // This just satisfies the editor when picking the transaction.portfolio_id below
                [key: string]: any
            }
            return (holdingId) => {
                if (state.transactions)
                    return state.transactions.filter((transaction: Transaction) => transaction.holding_id === holdingId)
                else
                    return null
            }
        }


    },

    actions: {
        replaceTransactions(holdingId, newTransactions) {
            if (this.transactions) {
                this.transactions = this.transactions.filter(transaction => transaction.holding_id !== holdingId)
                this.transactions.push(...newTransactions)
            } else {
                this.transactions = newTransactions
            }
        },

        deleteTransaction(transactionId) {
            this.transactions = this.transactions.filter(t => t.transaction_id !== transactionId)
        }
    }
})