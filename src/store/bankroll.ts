import { ALL_TYPES, ALL_VENUES } from "@/composables/useSessionFilters";
import { reactive } from "vue";

export const bankrollStore = reactive({
    activePage: 'dashboard',
    activeSessionId: null as string | null,
    sessionFilters: {
        types: [...ALL_TYPES],
        venues: [...ALL_VENUES]
    }
})