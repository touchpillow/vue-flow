import { Vue } from "vue-property-decorator";
import Flow from "./components/flow/view.vue";
const Components = {
  Flow,
};
Vue.component("flow", Flow);

export default Components;
