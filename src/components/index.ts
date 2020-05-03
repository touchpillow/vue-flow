import { Vue } from "vue-property-decorator";
import Flow from "./flow/view.vue";
const Components = {
  Flow,
};
Vue.component("vue-flow", Flow);

export default Components;
