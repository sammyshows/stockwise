import { defineStore } from 'pinia'
import { useUser } from '@/store/user'
import { userActivityLog } from "@/helpers/schemas";


export const useUtility = defineStore('utility', {
    state: () => {
        return {
            domain: useRuntimeConfig().DOMAIN
        }
    },

    actions: {
        logUserActivity(source, tag, message, referenceType = null, referenceId = null) {
            // e.g. ("User created portfolio", "INFO", "account", "portfolioId", "a3ergdhsejfghgtfevd-vfedvfd-dvfdfdv-dvddvdv")
            const user = useUser()
            const activityLog = structuredClone(userActivityLog)

            activityLog.userId = user.userId || null
            activityLog.platform = user.platform || null
            activityLog.source = source
            activityLog.tag = tag
            activityLog.message = message
            if (referenceType && referenceId)
                activityLog[referenceType] = referenceId

            console.log(activityLog)
            fetch(this.domain + '/api/user-activity-logs-create', {
                method: 'POST',
                body: JSON.stringify(activityLog)
            })
        }
    }
})