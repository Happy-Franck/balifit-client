<template>
  <v-container>
    <v-card
      width="auto"
      absolute
      style="z-index: 50;"
    >
    <v-progress-linear
        :active="userStore.loading"
        :indeterminate="userStore.loading"
        bottom
        color="deep-purple-accent-4"
      ></v-progress-linear>
    </v-card>
    <v-alert
      border="start"
      variant="tonal"
      closable
      close-label="Close Alert"
      color="deep-purple-accent-4"
      v-if="userStore.alert" :text="userStore.message"
      ></v-alert>
    <v-row>
      <v-col cols="12" sm="2">
        <v-sheet
          rounded="lg"
          min-height="268"
        >
        <div class="user" v-if="userStore.currentUser">
          <h4>{{userStore.currentUser.name}}</h4>
          <p>{{userStore.currentUser.email}}</p>
          <v-dialog scrollable
            transition="dialog-bottom-transition"
            width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-avatar v-bind="props" :image="`http://localhost:8000/storage/avatars/${userStore.currentUser.avatar}`" color="surface-variant" size="50"></v-avatar>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-toolbar
                  color="transparent"
                  text-color="red"
                  :title="userStore.currentUser.name"
                  absolute
                  style="z-index: 50;"
                ><v-btn
                    color="white"
                    variant="flat"
                    icon="mdi-close"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-toolbar>
                  <div>
                    <v-img
                      :width="500"
                      aspect-ratio="1"
                      :src="`http://localhost:8000/storage/avatars/${userStore.currentUser.avatar}`"
                    ></v-img>
                  </div>
              </v-card>
            </template>
          </v-dialog>
        </div>
        <div class="roles">
          <v-chip v-if="userRoles() === 'administrateur'"
            class="ma-2"
            color="cyan"
          >{{userRoles()}}</v-chip>
          <v-chip v-if="userRoles() === 'coach'"
            class="ma-2"
            color="primary"
          >{{userRoles()}}</v-chip>
          <v-chip v-if="userRoles() === 'challenger'"
            class="ma-2"
            color="pink"
            text-color="white"
          >{{userRoles()}}</v-chip>
        </div>
      </v-sheet>
      </v-col>
      <v-col cols="12" sm="8">
        <v-sheet
          min-height="70vh"
          rounded="lg"
        >
          <div class="role" v-if="userStore.currentUser">
            <h3>Gestion du rôle:</h3>
            <form @submit.prevent="assignRole">
                <v-select
                  required
                  v-model="role"
                  label="Select"
                  :items="rolePermissionStore.allRoles"
                ></v-select>
                <v-btn type="submit" :disabled="!role">modifier role</v-btn>
            </form>
          </div>
          <v-divider class="my-10"></v-divider>
          <div class="coaching">
            <div v-if="userRoles() === 'coach'">
              <h3>Assign challengers:</h3>
              <div class="px-4">
                  <span class="mr-2" v-for="elem in coached()" :key="elem.id">
                    <v-chip closable @click:close="removeChallenger(elem.id)" color="red">
                      {{elem.name}}
                    </v-chip>
                  </span>
              </div>
              <form @submit.prevent="updateChallengers">
                <v-select
                  required
                  multiple
                  v-model="challenger"
                  label="Select"
                  :items="notCoached()"
                  item-title="name"
                  item-value="id"
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 4">
                      <span>{{ item.title }}</span>
                    </v-chip>
                    <span
                      v-if="index === 4"
                      class="text-grey text-caption align-self-center"
                    >
                      (+{{ challenger.length - 4 }} autres)
                    </span>
                  </template>
                </v-select>
                <v-btn type="submit" :disabled="!challenger">modifier role</v-btn>
              </form>
            </div>
            <div v-if="userRoles() === 'challenger'">
              <h3>Assign coachs:</h3>
              <div v-for="elem in userCoachs()" :key="elem.id">
                <v-chip @click="removeCoach(elem.id)">
                  {{elem.name}}
                </v-chip>
              </div>
              <form @submit.prevent="updateCoachs">
                <v-select
                  required
                  multiple
                  v-model="coach"
                  label="Select"
                  :items="notUserCoach()"
                  item-title="name"
                  item-value="id"
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 4">
                      <span>{{ item.title }}</span>
                    </v-chip>
                    <span
                      v-if="index === 4"
                      class="text-grey text-caption align-self-center"
                    >
                      (+{{ coach.length - 4 }} autres)
                    </span>
                  </template>
                </v-select>
                <v-btn type="submit" :disabled="!coach">modifier role</v-btn>
              </form>
            </div>
          </div>
          <v-divider class="my-10"></v-divider>
          <div class="challengerAssignSeance" v-if="userRoles() === 'challenger'">
            <h3>Assigner une séance:</h3>
            <form @submit.prevent="createSeanceChallenger">
              <v-select
                required
                v-model="coachForSeance"
                :items="userStore.coachs"
                item-title="name"
                item-value="id"
              ></v-select>
              <v-btn type="submit" :disabled="!coachForSeance">Create Séance</v-btn>
            </form>
          </div>
          <div class="coachAssignSeance" v-if="userRoles() === 'coach'">
            <h3>Assigner une séance:</h3>
            <form @submit.prevent="createSeanceCoach">
              <v-select
                required
                v-model="challengerForSeance"
                :items="userStore.challengers"
                item-title="name"
                item-value="id"
              ></v-select>
              <v-btn type="submit" :disabled="!challengerForSeance">Create Séance</v-btn>
            </form>
          </div>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="2">
        <v-sheet v-if="seanceStore.userSeances.length > 0"
          rounded="lg"
          min-height="268"
        >
          <div class="list-seance">
            <div v-if="userRoles() === 'challenger'">
              <h3>Voici les séances de ce challenger:</h3>
            </div>
            <div v-if="userRoles() === 'coach'">
              <h3>Voici les séances de ce coach:</h3>
            </div>
            <div v-if="userRoles() === 'administrateur'">
              <h3>Voici les séances données par cet admin:</h3>
            </div>
            <ul>
              <li v-for="seance in seanceStore.userSeances" :key="seance.id">
                {{seance.created_at}}
                <router-link :to="{name: 'userSeance', params: {id: userStore.currentUser.id, idSeance: seance.id}}">
                  voir
                </router-link>
                <div @click="deleteSeance(seance.id)">
                  Supprimer
                </div>
              </li>
            </ul>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent , ref , watch } from 'vue'
import { useUserStore } from '@/store/AdminStore/UserStore'
import { useRolePermissionStore } from '@/store/AdminStore/RolePermissionStore'
import { useSeanceStore } from '@/store/AdminStore/SeanceStore'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
      const role = ref('')
      const coachForSeance = ref('')
      const challengerForSeance = ref('')
      const coach = ref<number[]>([])
      const challenger = ref<number[]>([])
      const router = useRoute()
      const userStore = useUserStore()
      const rolePermissionStore = useRolePermissionStore()
      const seanceStore = useSeanceStore()

      rolePermissionStore.getRoles()
      userStore.getAllCoachs()
      userStore.getAllChallengers()

      if(userStore.currentUser){
        if(userStore.currentUser.id != Number(router.params.id)){
          userStore.loading = true
          seanceStore.userSeances = []
          userStore.currentUser = null
          userStore.showUser(Number(router.params.id))
        }
      }
      if(!userStore.currentUser){
        userStore.loading = true
        seanceStore.userSeances = []
        userStore.currentUser = null
        userStore.showUser(Number(router.params.id))
      }

      const assignRole = () => {
        userStore.assignRole(Number(router.params.id) , {role: role.value})
        role.value = ''
        if(role.value === 'coach'){
          userStore.getAllCoachs()
        }
        else if(role.value === 'challenger'){
          userStore.getAllChallengers()
        }
      }

      const userRoles = () => {
        if(userStore.currentUser){
          if(userStore.currentUser.roles){
            var result = [] as String[]
            userStore.currentUser.roles.map((item) => {
              result.push(item.name)
            });
            return result[0]
          }
        }
      }

      watch(
        [() => userStore.message, () => userStore.alert],
        ([newMessage, newAlert]) => {
          if (newMessage !== '' && newAlert) {
            userStore.showUser(Number(router.params.id))
            setTimeout(() => {
              userStore.message = '';
              userStore.alert = false;
            }, 5000);
          }
        }
      )


      //coach -> challengers
      const updateChallengers = () => {
        userStore.updateChallengers(Number(router.params.id), {new_challengers: challenger.value})
        challenger.value = []
      }
      const notCoached = () => {
        return userStore.challengers.filter(function(item) {
          return !userStore.currentUser?.challengers?.some(function(element){
              return item.id === element.id
          });
        });
      }
      const coached = () => {
        return userStore.currentUser?.challengers
      }
      const removeChallenger = (challengerId : number) => {
        userStore.removeChallenger(Number(router.params.id), challengerId)
      }

      //challenger -> coachs
      const updateCoachs = () => {
        userStore.updateCoachs(Number(router.params.id), {new_coachs: coach.value})
        coach.value = []
      }
      const notUserCoach = () => {
        return userStore.coachs.filter(function(item) {
          return !userStore.currentUser?.coachs?.some(function(element){
              return item.id === element.id
          });
        });
      }
      const userCoachs = () => {
        return userStore.currentUser?.coachs
      }
      const removeCoach = (coachId : number) => {
        userStore.removeCoach(Number(router.params.id), coachId)
      }

      const createSeanceChallenger = () => {
        var id = 0
        if(userStore.currentUser){
            id = userStore.currentUser.id
        }
        seanceStore.assignCoach(id, {
          coach_id: parseInt(coachForSeance.value)
        })
        coachForSeance.value = ''
      }
      const createSeanceCoach = () => {
        var id = 0
        if(userStore.currentUser){
            id = userStore.currentUser.id
        }
        seanceStore.assignChallenger(id, {
          challenger_id: parseInt(challengerForSeance.value)
        })
        challengerForSeance.value = ''
      }

      const deleteSeance = (seanceId : number) => {
        seanceStore.destroySeance(seanceId)
      }

      return{ userStore , rolePermissionStore , role , coach , coachForSeance , challengerForSeance , challenger , assignRole , userRoles , updateChallengers , notCoached , coached , removeChallenger , updateCoachs , removeCoach , notUserCoach , userCoachs , createSeanceChallenger , createSeanceCoach , seanceStore , deleteSeance }
    }
})
</script>
