import { defineStore } from 'pinia'
import { useUser } from '@/store/user'
import { UserActivityLog } from "@/interfaces/utility";


export const useUtility = defineStore('utility', {
    state: () => {
        return {
            domain: useRuntimeConfig().DOMAIN
        }
    },

    actions: {
        logUserActivity(code: number, source: string, tag: string, message: string, referenceType: (string | null) = null, referenceId: (string | null) = null) {
            // e.g. (23, "User created portfolio", "INFO", "account", "portfolioId", "7ad8b5e6-2bcd-4466-93b9-1833eea45d59")
            // IDEA: If we need more than one reference, add another optional Type and Id pair, e.g. referenceType2
            const user = useUser()

            const userActivityLog: UserActivityLog = {
                userId: user.userId || null,
                code: code,
                message: message,
                source: source,
                tag: tag,
                platform: user.platform || null,
                studyId: null,
                portfolioId: null,
                assetId: null,
                holdingId: null,
                transactionId: null
            }

            if (referenceType && referenceId)
                userActivityLog[referenceType] = referenceId

            fetch(this.domain + '/api/user-activity-logs-create', {
                method: 'POST',
                body: JSON.stringify(userActivityLog)
            })
        }
    }
})