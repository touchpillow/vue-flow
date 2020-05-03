import { Vue } from "vue-property-decorator";
import Flow from "./components/flow/view.vue";
import FlowItem from "./components/flow/flow_item/view.vue";
const Components = {
  Flow,
  FlowItem,
};
Vue.component("flow", Flow);

export default Components;
