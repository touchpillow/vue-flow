import { Vue } from "vue-property-decorator";
import Flow from "./components/flow/view.vue";
import FlowItem from "./components/flow/flow_item/view.vue";
import "./assets/common.less";
const Components = {
  Flow,
  FlowItem,
};
Vue.component("flow", Flow);
Vue.component("flow-item", FlowItem);

export default Components;
