import { ALL_TYPES, ALL_VENUES } from "@/composables/useSessionFilters";
import { reactive } from "vue";

export const bankrollStore = reactive({
    activePage: 'dashboard',
    sessionFilters: {
        types: [...ALL_TYPES],
        venues: [...ALL_VENUES]
    }
})