<template>
  <v-app>
    <div class="text-xs-center">
      <v-dialog v-model="dialog" max-width="500px" data-app>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field
                    ref="number"
                    v-model="editedItem.number"
                    label="Телефон"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md8>
                  <v-text-field
                    v-model="editedItem.name"
                    label="Имя"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.address"
                    label="Адрес"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="close">Отмена</v-btn>
            <v-btn color="green darken-1" text @click="save">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-card color="grey lighten-4" flat height="200px" tile>
      <v-toolbar>
        <v-toolbar-title>Телефонный справочник</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchTerm"
          prepend-icon="search"
          label="Поиск"
          single-line
          hide-details
          clearable
        ></v-text-field>
        <v-btn color="green" dark class="mb-2" @click="dialog = true">
          <v-icon dark>add</v-icon>Телефон
        </v-btn>
      </v-toolbar>
      <!-- таблица с данными
        :headers="headers" // источник заголовков столбцов
        :items="Phones" // источник данных
        :page.sync="pagination.page" // текущая страница
        :items-per-page="pagination.rowsPerPage" // сколько записей на страницу
        :single-expand="true" // разворачивать только одну строку
        show-expand // показывать или нет разворот строки
        item-key="id" // ключевое поле
        hide-default-footer // убрать встроенную пагинацию
        class="elevation-1" // чтобы тень была
      -->
      <v-data-table
        :headers="headers"
        :items="Phones"
        :page.sync="pagination.page"
        :items-per-page="pagination.rowsPerPage"
        :single-expand="true"
        show-expand
        item-key="id"
        hide-default-footer
        class="elevation-1"
      >
        <!-- у таблицы есть несколько предопределенных слотов, скрытых элментов, которым можно
        описать шаблон и выводить при опреденных событиях-->
        <template v-slot:item.action="{ item }">
          <v-icon class="mr-2" @click="selectPhone(item)">edit</v-icon>
          <v-icon @click="deletePhone(item)">delete_forever</v-icon>
        </template>
        <!-- этот при раскрытии дополлнительной строки-->
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">{{ item.address }}</td>
        </template>
        <!--если нет данных при поиске -->
        <template v-slot:no-results>
          <v-alert :value="true" color="orange" icon="warning"
            >По фразе "{{ searchTerm }}" ничего не найдено.</v-alert
          >
        </template>
        <!--Если бекенд не вернул ничего -->
        <template v-slot:no-data>
          <v-alert :value="true" color="error" icon="warning"
            >Нет данных.</v-alert
          >
        </template>
      </v-data-table>
      <!--элемент пагинации. Собственно ему надо передовать текущую страницу и всего страниц -->
      <div class="text-xs-center pt-3">
        <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
      </div>
    </v-card>
    <!--снекбар, уведоплялочка всплывашка, внутри снекбара можно описать любой шаблон -->
    <v-snackbar
      v-model="snackbar.show"
      top
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <v-btn fab flat :color="snackbar.color" @click="snackbar.show = false">
        <v-icon dark>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
// вынес все запросы в отдельный файл
import {
  ALL_PHONES_QUERY,
  ADD_PHONE_MUTATION,
  DELETE_PHONE_MUTATION,
  UPDATE_PHONE_MUTATION
} from "./queries";

export default {
  name: "App",
  data() {
    return {
      dialog: false,
      // структура для уведомлений
      snackbar: {
        show: false,
        color: "green",
        text: "Сообщение",
        timeout: 5000 //само пропадет через 5 сек
      },
      // структура данных при редактировании
      editedItem: {
        id: "",
        number: "",
        name: "",
        address: ""
      },
      // структура данных для простоты очистки после правки этот объект вливаем в editedItem
      defaultItem: {
        id: "",
        number: "",
        name: "",
        address: ""
      },
      searchTerm: "", // переременная, где будет строка поиска
      //параметры пагинации
      pagination: {
        descending: false, // сортировка по убыванию выключена
        sortBy: "id", // поле сортировки по умолчанию
        page: 1, // текущая страница
        rowsPerPage: 5 // поскольку выводить строк в таблицу
      },
      headers: [
        // у vuetify таблицы более богатые возможности
        // описания заголовков столбцов
        {
          text: "Телефон", // название в интерфейсе
          align: "left", // выравнивание
          sortable: true, // возможность сортировки
          value: "number" // поле в базе
        },
        {
          text: "Имя",
          align: "left",
          sortable: true,
          value: "name"
        },
        // это фиктивный столбец, для инструментов правки и удаления
        // обязательно нужно указать имя столбца, это имя используется в slot для вывода
        // содержимого
        { text: "", value: "action", sortable: false }
      ]
    };
  },
  apollo: {
    Phones: {
      query: ALL_PHONES_QUERY
    }
  },
  computed: {
    formTitle() {
      return this.editedItem.id === ""
        ? "Добавить телефон"
        : "Исправить телефон";
    },
    pages() {
      // если колияечество записей на странице нулевое, то на ноль делить нельзя
      // выводим сразу количество страниц 0 и пагинатора не будет

      if (
        this.Phones &&
        (this.pagination.rowsPerPage != null ||
          this.pagination.rowsPerPage != 0)
      )
        // если данные с бэкенда есть, то считаем
        return Math.ceil(this.Phones.length / this.pagination.rowsPerPage);
      else return 0; //
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    addPhone() {
      // в методе addPhoneByInput в качестве параметра идет объект
      // если описать каждый параметр, то их можно было бы через запятую передать
      // вида variables: {number,name}
      const input = {
        input: {
          number: this.editedItem.number,
          name: this.editedItem.name
        }
      };
      // после изменение данных читаем состояние в базе через запрос refetchQueries
      // Vue обновит данные в интерфейсе сам
      this.$apollo.mutate({
        mutation: ADD_PHONE_MUTATION,
        variables: input,
        refetchQueries: [
          {
            query: ALL_PHONES_QUERY
          }
        ]
      });
    },
    deletePhone(input) {
      if (confirm("Удалить номер ?")) {
        this.$apollo.mutate({
          mutation: DELETE_PHONE_MUTATION,
          variables: {
            id: input.id
          },
          refetchQueries: [
            {
              query: ALL_PHONES_QUERY
            }
          ]
        });
      }
    },
    // эта функция заполняет поля ввода в форме редактирования
    selectPhone(input) {
      this.editedItem.id = input.id;
      this.editedItem.number = input.number;
      this.editedItem.name = input.name;
      this.dialog = true;
      //this.$refs.number.focus();
    },
    //в реализации этого метода используются в качестве параметров поля раздельно
    // это не обязательно, просто в качестве примера. При добавлении объект, а тут поля
    updatePhone() {
      this.$apollo.mutate({
        mutation: UPDATE_PHONE_MUTATION,
        variables: {
          id: this.editedItem.id,
          number: this.editedItem.number,
          name: this.editedItem.name
        },
        refetchQueries: [
          {
            query: ALL_PHONES_QUERY
          }
        ]
      });
    },

    save() {
      var mode = "ИСПРАВЛЕНО! ";

      if (this.editedItem.id != "") {
        this.updatePhone();
      } else {
        this.addPhone();
        this.Phones.push(this.editedItem);
        this.pagination.sortBy = "id";
        this.pagination.descending = false;
        this.pagination.page = this.pages;
        mode = "ДОБАВЛЕНО!";
      }

      this.snackbar.text = `${mode} ${this.editedItem.number} ${this.editedItem.name}`;
      this.snackbar.color = "green";
      this.snackbar.show = true;
      this.close();
    }
  }
};
</script>
