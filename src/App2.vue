<template>
  <v-app>
    <v-card color="grey lighten-4" flat height="200px" tile>
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
        <template v-slot:item.action="{ item }">
          <v-icon class="mr-2" @click="selectPhone(item)">edit</v-icon>
          <v-icon @click="deletePhone(item)">delete_forever</v-icon>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">{{ item.address }}</td>
        </template>
        <template v-slot:no-results>
          <v-alert :value="true" color="orange" icon="warning"
            >По фразе "{{ searchTerm }}" ничего не найдено.</v-alert
          >
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="error" icon="warning"
            >Нет данных.</v-alert
          >
        </template>
      </v-data-table>
      <div class="text-xs-center pt-3">
        <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
      </div>
    </v-card>
  </v-app>
</template>

<script>
import { gql } from "apollo-boost";
// для компактности выделяем фрагмент gql,
// его мы будем часто использовать. Этот фрагмент наша структура таблицы
const fragment = gql`
  fragment Phone on Phone {
    id
    number
    name
  }
`;
// теперь опишем наш основной запрос, константы потом проще использовать в коде
// получаем все записи телефонов
// переопределенный фрагмент - это формат вывода данных, описываем как ...Phone
// аналогично запрос можно описать так
// const ALL_PHONES_QUERY = gql`
//   query Phones {
//     Phones {
//       id
//       number
//       name
//     }
//   }
// `;

const ALL_PHONES_QUERY = gql`
  query Phones {
    Phones {
      ...Phone
    }
  }
  ${fragment}
`;
//Описываем запрос на добавление в формате GraphQL
const ADD_PHONE_MUTATION = gql`
  mutation($input: inputPhone!) {
    addPhoneByInput(input: $input) {
      ...Phone
    }
  }
  ${fragment}
`;
const DELETE_PHONE_MUTATION = gql`
  mutation($id: ID!) {
    deletePhoneByID(id: $id)
  }
`;

const UPDATE_PHONE_MUTATION = gql`
  mutation($id: ID!, $number: String!, $name: String!) {
    updatePhoneByID(id: $id, number: $number, name: $name) {
      ...Phone
    }
  }
  ${fragment}
`;

export default {
  name: "App",
  data() {
    return {
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
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.rowsPerPage == 0
      )
        return 0;
      else if (this.Phones)
        return Math.ceil(this.Phones.length / this.pagination.rowsPerPage);
      else return 0;
    }
  },
  methods: {
    clearForm() {},
    addPhone() {
      // в методе addPhoneByInput в качестве параметра идет объект
      // если описать каждый параметр, то их можно было бы через запятую передать
      // вида variables: {number,name}
      const input = {
        input: {
          number: this.number,
          name: this.name
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
      this.clearForm();
    },
    deletePhone(id) {
      if (confirm("Удалить номер ?")) {
        this.$apollo.mutate({
          mutation: DELETE_PHONE_MUTATION,
          variables: {
            id
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
      this.id = input.id;
      this.number = input.number;
      this.name = input.name;
      this.$refs.number.focus();
    },
    //в реализации этого метода используются в качестве параметров поля раздельно
    // это не обязательно, просто в качестве примера. При добавлении объект, а тут поля
    updatePhone() {
      this.$apollo.mutate({
        mutation: UPDATE_PHONE_MUTATION,
        variables: {
          id: this.id,
          number: this.number,
          name: this.name
        },
        refetchQueries: [
          {
            query: ALL_PHONES_QUERY
          }
        ]
      });
      this.clearForm();
    }
  }
};
</script>
