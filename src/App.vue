<template>
  <div id="app" class="full">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";

@Component({
  components: {}
})
export default class App extends Vue {}
</script>

<style lang="less">
html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
