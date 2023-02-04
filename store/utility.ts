import { defineStore } from 'pinia'
import { UserActivityLog } from "@/interfaces/utility";
import { useUser } from '@/store/user'
import { useAuth } from '@/store/auth'
import { App } from "@capacitor/app";
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

export const useUtility = defineStore('utility', {
    state: () => {
        return {
            domain: useRuntimeConfig().DOMAIN,
            platform: Capacitor.getPlatform()
        }
    },

    actions: {
        async updateUserInfo(version: (string | null) = null) {
            if (this.platform !== 'web') {
                const appInfo = await App.getInfo()

                // Only reason we're checking the version at the moment is so we're not spamming the database every time the user opens the app, nothing wrong with calling it every time if desired.
                if (version !== appInfo.version) {
                    const deviceInfo = await Device.getInfo()

                    await fetch(this.domain + '/api/user-update-device', {
                        headers: {
                            authorization: useAuth().accessToken
                        },
                        method: 'POST',
                        body: JSON.stringify({
                            userId: useUser().userId,
                            deviceOS: deviceInfo.osVersion,
                            deviceModel: deviceInfo.model,
                            stockwiseVersion: appInfo.version
                        })
                    }).then(response => {
                        if (response.status === 200) {
                            const key = 'version'
                            const value = appInfo.version
                            SecureStoragePlugin.set({ key, value })
                        }
                    })
                }
            }
        },

        logUserActivity(code: number, source: string, tag: string, message: string, referenceOneType: (string | null) = null, referenceOneId: (string | null) = null, referenceTwoType: (string | null) = null, referenceTwoId: (string | null) = null) {
            // e.g. (23, "User created portfolio", "INFO", "account", "portfolioId", "7ad8b5e6-2bcd-4466-93b9-1833eea45d59")

            const userActivityLog: UserActivityLog = {
                userId: useUser().userId || null,
                code: code,
                message: message,
                source: source,
                tag: tag,
                platform: this.platform || null,
                studyId: null,
                portfolioId: null,
                assetId: null,
                holdingId: null,
                transactionId: null
            }

            if (referenceOneType && referenceOneId)
                userActivityLog[referenceOneType] = referenceOneId

            if (referenceTwoType && referenceTwoId)
                userActivityLog[referenceTwoType] = referenceTwoId

            fetch(this.domain + '/api/user-activity-logs-create', {
                method: 'POST',
                body: JSON.stringify(userActivityLog)
            })
        }
    }
})