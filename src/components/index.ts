import { Vue } from "vue-property-decorator";
import Flow from "./flow/view.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
const Components = {
  Flow,
};
Vue.use(ElementUI);
Vue.component("vue-flow", Flow);

export default Components;
