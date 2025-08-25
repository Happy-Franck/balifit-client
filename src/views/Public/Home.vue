<template>
  <div>
    <v-row>
      <v-col cols="12" sm="12">
        <v-parallax :src="back" height="auto">
          <div class="d-flex flex-column fill-height justify-center align-center text-white">
            <h1 class="text-h4 font-weight-thin mb-4">
              Vuetify
            </h1>
            <h4 class="subheading">
              Build your application today!
            </h4>
          </div>
        </v-parallax>
      </v-col>
    </v-row>
    <v-container>
      <v-row class="overflow-auto mx-auto">
        <v-col cols="12" sm="12">
          <div>
            <v-alert
              v-model="alert"
              border="start"
              variant="tonal"
              closable
              close-label="Close Alert"
              color="deep-purple-accent-4"
              title="Closable Alert"
            >
              Aenean imperdiet. Quisque id odio. Cras dapibus. Pellentesque ut neque. Cras dapibus.

              Vivamus consectetuer hendrerit lacus. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Curabitur blandit mollis lacus. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo.
            </v-alert>

            <div
              v-if="!alert"
              class="text-center"
            >
              <v-btn @click="alert = true">
                Reset
              </v-btn>
            </div>
          </div>


          <div>
            <v-banner
              lines="one"
              icon="mdi-lock"
              color="deep-purple-accent-4"
              class="my-4"
            >
              <v-banner-text>
                Banner with one line of text.
              </v-banner-text>

              <template v-slot:actions>
                <v-btn>Action</v-btn>
              </template>
            </v-banner>

            <v-banner
              lines="two"
              icon="mdi-weather-hurricane"
              color="error"
              class="my-4"
            >
              <v-banner-text>
                Banner with two lines of text. If the text is too long to fit on two lines then an ellipsis will be used to hide the remaining content. So this next line will be hidden.
              </v-banner-text>

              <template v-slot:actions>
                <v-btn>Action</v-btn>
              </template>
            </v-banner>

            <v-banner
              lines="three"
              icon="$warning"
              color="warning"
              class="my-4"
            >
              <v-banner-text>
                Banner with three lines of text. One or two lines is preferable. Three lines should be considered the absolute maximum length on desktop in order to keep messages short and actionable.
              </v-banner-text>

              <template v-slot:actions>
                <v-btn>Action</v-btn>
              </template>
            </v-banner>
          </div>

        </v-col>
        <v-col
          cols="12"
          sm="2"
        >
          <v-banner
            sticky="true"
            lines="one"
          >
            <template v-slot:text>
              We can't save your edits while you are in offline mode.
            </template>

            <template v-slot:actions>
              <v-btn color="deep-purple-accent-4">
                Go Online
              </v-btn>
            </template>
          </v-banner>
        </v-col>

        <v-col
          cols="12"
          sm="8"
        >
          <v-sheet
            min-height="70vh"
            rounded="lg"
          >
            <v-row>
              <v-col cols="12" sm="6">
                <div>
                  <v-hover v-slot="{ isHovering, props }">
                    <v-card
                      class="mx-auto"
                      color="grey-lighten-4"
                      max-width="600"
                      v-bind="props"
                    >
                      <v-img
                        :aspect-ratio="16/9"
                        cover
                        :src="one"
                      >
                        <v-expand-transition>
                          <div
                            v-if="isHovering"
                            class="d-flex transition-fast-in-fast-out bg-orange-darken-2 v-card--reveal text-h2"
                            style="height: 100%;"
                          >
                            $14.99
                          </div>
                        </v-expand-transition>
                      </v-img>

                      <v-card-text class="pt-6">
                        <div class="font-weight-light text-grey text-h6 mb-2">
                          For the perfect meal
                        </div>

                        <h3 class="text-h4 font-weight-light text-orange mb-2">
                          QW cooking utensils
                        </h3>

                        <div class="font-weight-light text-h6 mb-2">
                          Our Vintage kitchen utensils delight any chef.<br>
                          Made of bamboo by hand
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-hover>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-sheet elevation="12" max-width="600" rounded="lg" width="100%" class="pa-4 text-center mx-auto">
                  <v-icon class="mb-5" color="success" icon="mdi-check-circle" size="112"></v-icon>
                  <h2 class="text-h5 mb-6">You reconciled this account</h2>
                  <p class="mb-4 text-medium-emphasis text-body-2">
                    To see a report on this reconciliation, click <a href="#" class="text-decoration-none text-info">View reconciliation report.</a>
                    <br>
                    Otherwise, you're done!
                  </p>
                  <v-divider class="mb-4"></v-divider>
                  <div class="text-end">
                    <v-btn class="text-none" color="success" rounded variant="flat" width="90">Done</v-btn>
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="12" sm="6">
                <v-sheet border="md" class="pa-6 text-white mx-auto" color="#141518" max-width="400">
                  <h4 class="text-h5 font-weight-bold mb-4">Your Privacy</h4>
                  <p class="mb-8">
                    This business determines the use of personal data collectied on our media properties and across the internet. We may collect data that you submit to us directly or data that we collect automatically including from cookies (such as device information or IP address).
                    <br>
                    <br>
                    Please read our <a href="#" class="text-red-accent-2">Privacy Policy</a> to learn about our privacy practices or click "Your Preferences" to exercise control over your data.
                  </p>
                  <v-btn block class="text-none text-black mb-4" color="red-accent-2" size="x-large" variant="flat">
                    Accept
                  </v-btn>
                  <v-btn block class="text-none text-black" color="red-accent-2" size="x-large" variant="outlined">
                    Your Preferences
                  </v-btn>
                </v-sheet>
              </v-col>
              <v-col cols="12" sm="6">
                <v-expansion-panels>
                  <v-expansion-panel
                    title="Title"
                    text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima"
                  >
                  </v-expansion-panel>
                </v-expansion-panels>
                <br/>
                <div>
                  <v-breadcrumbs :items="['okokok','muda','ora']">
                    <template v-slot:divider>
                      <v-icon icon="mdi-forward"></v-icon>
                    </template>
                  </v-breadcrumbs>

                  <v-breadcrumbs :items="['okokok','muda','ora']">
                    <template v-slot:divider>
                      <v-icon icon="mdi-chevron-right"></v-icon>
                    </template>
                  </v-breadcrumbs>
                </div>
                <div>
                  <v-breadcrumbs
                    :items="['okokok','muda','ora']"
                    divider="-"
                  ></v-breadcrumbs>

                  <v-breadcrumbs
                    :items="['okokok','muda','ora']"
                    divider="."
                  ></v-breadcrumbs>
                </div>
                <br/>
                <v-slider v-model="volume" :min="0" :max="10" :step="1">
                </v-slider>
              </v-col>
              <v-col cols="12" sm="6">
                <v-timeline side="end">
                  <v-timeline-item
                    v-for="item in time"
                    :key="item.id"
                    :dot-color="item.color"
                    size="small"
                  >
                    <v-alert
                      :value="true"
                      :color="item.color"
                      :icon="item.icon"
                    >
                      Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.
                    </v-alert>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
              <v-col cols="12" sm="6">
                <v-timeline side="end" align="start">
                  <v-timeline-item
                    dot-color="pink"
                    size="small"
                  >
                  <template v-slot:icon>
                    <v-avatar :image="three"></v-avatar>
                  </template>
                  <!--<template v-slot:opposite>
                    <span>Tus eu perfecto</span>
                  </template>-->
                    <div class="d-flex">
                      <strong class="me-4">5pm</strong>
                      <div>
                        <strong>New Icon</strong>
                        <div class="text-caption">
                          Mobile App
                        </div>
                      </div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="teal-lighten-3"
                    size="small"
                  >
                    <div class="d-flex">
                      <strong class="me-4">3-4pm</strong>
                      <div>
                        <strong>Design Stand Up</strong>
                        <div class="text-caption mb-2">
                          Hangouts
                        </div>
                      </div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="pink"
                    size="small"
                  >
                    <div class="d-flex">
                      <strong class="me-4">12pm</strong>
                      <div>
                        <strong>Lunch break</strong>
                      </div>
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    dot-color="teal-lighten-3"
                    size="small"
                  >
                    <div class="d-flex">
                      <strong class="me-4">9-11am</strong>
                      <div>
                        <strong>Finish Home Screen</strong>
                        <div class="text-caption">
                          Web App
                        </div>
                      </div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
              <v-col cols="12" sm="6">
                <v-sheet class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4" elevation="4" height="250" rounded max-width="800" width="100%">
                  <div>
                    <h2 class="text-h4 font-weight-black text-orange">Congratulations!</h2>
                    <div class="text-h5 font-weight-medium mb-2">
                      You are officially a part of the Vuetify Community!
                    </div>
                    <p class="text-body-2 mb-4">
                      Please head over to your inbox/spam or others folder to find our verificaiton email.
                    </p>
                    <v-btn variant="text" color="orange">Go to Login</v-btn>
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-sheet>
        </v-col>

        <v-col
          cols="12"
          sm="2"
        >
          <v-sheet
            rounded="lg"
            min-height="268"
          >
            <v-carousel show-arrows="hover" cycle progress="primary" hide-delimiters>
              <v-carousel-item
                v-for="(item,i) in items"
                :key="i"
                :src="item"
                cover
              ></v-carousel-item>
            </v-carousel>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </div>

</template>

<script>
export default {
  data: () => ({
    volume: 2,
    alert: true,
  }),
}
</script>

<script setup>
import { useAuthStore } from '@/store/AuthStore'
import one from "@/assets/1.jpg"
import two from "@/assets/2.jpg"
import three from "@/assets/3.jpg"
import four from "@/assets/4.jpg"
import five from "@/assets/5.jpg"
import back from "@/assets/back.jpg"
import { useCategoryStore } from '@/store/ChallengerStore/CategoryStore'
import { useTrainingStore } from '@/store/ChallengerStore/TrainingStore'

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const trainingStore = useTrainingStore()

// Initialize stores for challenger dashboard
if (authStore.isChallenger) {
  categoryStore.getCategories()
  trainingStore.getTrainings()
}

const items = [one, two, three, four, five]

const time = [
  {
    id: 1,
    color: 'info',
    icon: 'mdi-information',
  },
  {
    id: 2,
    color: 'error',
    icon: 'mdi-alert-circle',
  },
]
</script>

<style>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .9;
  position: absolute;
  width: 100%;
}
</style> 