import { defineStore } from 'pinia'

type Study = { // This just satisfies the editor when picking the holding.portfolio_id below
    [key: string]: any
}

export const useStudies = defineStore('studies', {
    state: () => {
        return {
            studies: null as (Object[] | null)
        }
    },

    getters: {
        getCompleted: (state) => {
            return () => {
                if (state.studies)
                    return state.studies.filter((study: Study) => study.completed_qs === 9)
                else
                    return null
            }
        },

        getUncompleted: (state) => {
            return () => {
                if (state.studies)
                    return state.studies.filter((study: Study) => study.completed_qs < 9)
                else
                    return null
            }
        },

        getStudy: (state) => {
            return (studyId) => {
                if (state.studies)
                    return state.studies.find((t: Study) => t.study_id === studyId)
                else
                    return null
            }
        }
    },

    actions: {
        deleteStudy(studyId) {
            this.studies = this.studies.filter(s => s.study_id !== studyId)
        }
    }
})