<template>
  <v-app>
    <v-alert
      :value="alert"
      type="success"
      icon="mdi-vuetify"
      transition="scale-transition"
      >Vuetify подключен и работает!</v-alert
    >
    <v-layout justify-center wrap>
      <v-btn fab dark large color="purple" @click="alert = !alert">
        <v-icon dark>mdi-vuetify</v-icon>
      </v-btn>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    alert: false
  })
};
</script>
