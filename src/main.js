import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import VueApollo from "vue-apollo";
import ApolloClient from "apollo-boost";

Vue.config.productionTip = false;
Vue.use(VueApollo);
//Собственно наш клиент apollo для vue
const Client = new ApolloClient({
  uri: "https://3079c.sse.codesandbox.io/"
});
//Создаем провайдер для нашего клиента
const apolloProvider = new VueApollo({
  defaultClient: Client
});

new Vue({
  vuetify,
  render: h => h(App),
  apolloProvider
}).$mount("#app");
