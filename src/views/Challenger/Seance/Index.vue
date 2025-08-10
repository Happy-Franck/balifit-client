<template>
  <v-container>
    <v-row>
      <v-dialog scrollable v-model="dialog" persistent transition="dialog-top-transition" width="1024">
        <template v-slot:activator="{ props }">
          <v-btn color="primary" v-bind="props">Créer une seance</v-btn>
        </template>
        <form enctype="multipart/form-data" @submit.prevent="createSeance">
          <v-card height="80vh">
            <v-card-title>
              <span class="text-h5">Création d'une seance</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-row>
                      <v-col cols="6">
                        <v-file-input @change="uploadDebut" show-size prepend-icon="mdi-camera" v-model="imageDebut" clearable label="ImageDebut"></v-file-input>
                      </v-col>
                      <v-col cols="6">
                        <v-file-input @change="uploadFin" show-size prepend-icon="mdi-camera" v-model="imageFin" clearable label="ImageFin"></v-file-input>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="8">
                    <h4>Trainings</h4>
                    <v-btn color="purple" @click="addInput">Ajouter un champ</v-btn>
                    <div id="all-data" >
                      <div v-for="(input, index) in inputs" :key="index" class="list-input">
                        <v-row>
                          <v-col cols="3">
                            <div class="trainingslist">
                              <v-select
                                v-model="input.training"
                                :items="trainingStore.trainings"
                                item-title="name"
                                item-value="id"
                                label="Training"
                                required
                                @update:model-value="onTrainingChange(input.training)"
                              ></v-select>
                            </div>
                          </v-col>
                          <v-col cols="3">
                            <div class="serietraining">
                              <v-text-field v-model="input.series" name="series[]" label="Series" type="number" dense outlined></v-text-field>
                            </div>
                          </v-col>
                          <v-col cols="3">
                            <div v-if="input.useRepetitions" class="reptraining">
                              <v-text-field v-model="input.repetitions" name="repetitions[]" label="Repetitions" type="number" dense outlined></v-text-field>
                            </div>
                            <div v-else class="dureetraining">
                              <v-text-field v-model="input.duree" name="duree[]" label="Duration" type="number" dense outlined></v-text-field>
                            </div>
                          </v-col>
                          <v-col cols="3" class="d-flex justify-content-center">
                            <v-btn v-if="index > 0" @click="deleteInput(index)" icon="mdi-delete-outline"></v-btn>
                            <div class="toggle-container">
                              <v-checkbox
                                v-model="input.useRepetitions"
                                label="Use Repetitions"
                                dense
                              ></v-checkbox>
                            </div>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <h4>Aperçu des muscles</h4>
                    <div ref="createContainer" id="create-container" style="height: 300px; width: 100%;"></div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="dialog = false">Close</v-btn>
              <v-btn color="blue-darken-1" variant="text" type="submit">Save</v-btn>
            </v-card-actions>
          </v-card>
        </form>
      </v-dialog>

      <v-col cols="12" sm="12" style="overflow-x: scroll;" class="mb-5">
        <v-timeline direction="horizontal" side="end" align="center">
          <v-timeline-item v-for="(seance , index) in seanceStore.seances" :key="index" @click="show(seance.id)" dot-color="teal-lighten-3" size="large">
            <template v-slot:icon>
              <v-avatar v-if="seance.coach_id" class="primary" :image="seanceStore.getCoachAvatar(seance.coach_id)"></v-avatar>
              <v-avatar v-else class="pink" :image="seanceStore.getCoachAvatar(seance.challenger_id)"></v-avatar>
            </template>
            <v-tooltip activator="parent" location="bottom" v-if="seance.validated == false">
              A valider
            </v-tooltip>
            <v-tooltip activator="parent" location="bottom" v-if="seance.validated == true">
              Validé
            </v-tooltip>
            <v-tooltip activator="parent" location="bottom" v-if="seance.validated === null">
              En attente
            </v-tooltip>
            <div class="d-flex flex-column align-start justify-center" style="width: 100%;">
              <strong style="width: 140px; text-align: center;">{{seanceStore.dateTime(seance.created_at)}}</strong>
              <strong style="width: 140px; text-align: center;">{{seanceStore.hourTime(seance.created_at)}}</strong>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-col>

      <v-col
        cols="12"
        sm="8"
      >
        <v-row>
          <div v-if="!seanceStore.currentSeanceCoach">
          </div>
          <v-col cols="12">
            <v-row>
              <div v-if="seanceStore.currentSeance">
                <div v-if="seanceStore.currentSeance.coach_id">
                  <div v-if="seanceStore.currentSeance.validated == false">
                    <v-btn color="green" @click="confirmer(seanceStore.currentSeance.id)">Valider la seance</v-btn>
                    <v-btn color="yellow" @click="decliner(seanceStore.currentSeance.id)">Signaler une erreur</v-btn>
                  </div>
                </div>
                <div v-if="!seanceStore.currentSeanceCoach">
                  <v-btn color="red" @click="deleteSeance(seanceStore.currentSeance?.id)">Supprimer la seance</v-btn>
                  <v-dialog scrollable v-model="modal" persistent width="1024">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props">Ajout exercices</v-btn>
                    </template>
                    <form enctype="multipart/form-data" @submit.prevent="addTraining">
                      <v-card height="80vh">
                        <v-card-title>
                          <span class="text-h5">Ajout exercices</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="12">
                                <v-btn color="purple" @click="addField">Ajouter un champ</v-btn>
                              </v-col>
                              <v-col cols="12">
                                <div id="all-data" >
                                  <div v-for="(field, index) in fields" :key="index" class="list-field">
                                    <v-row>
                                      <v-col cols="3">
                                        <div class="trainingslist">
                                          <v-select
                                            v-model="field.training"
                                            :items="trainingStore.trainings"
                                            item-title="name"
                                            item-value="id"
                                            label="Training"
                                            required
                                          ></v-select>
                                        </div>
                                      </v-col>
                                      <v-col cols="3">
                                        <div class="serietraining">
                                          <v-text-field v-model="field.series" name="series[]" label="Series" type="number" dense outlined></v-text-field>
                                        </div>
                                      </v-col>
                                      <v-col cols="3">
                                        <div v-if="field.useRepetitions" class="reptraining">
                                          <v-text-field v-model="field.repetitions" name="repetitions[]" label="Repetitions" type="number" dense outlined></v-text-field>
                                        </div>
                                        <div v-else class="dureetraining">
                                          <v-text-field v-model="field.duree" name="duree[]" label="Duration" type="number" dense outlined></v-text-field>
                                        </div>
                                      </v-col>
                                      <v-col cols="3" class="d-flex justify-content-center">
                                        <v-btn v-if="index > 0" @click="deleteField(index)" icon="mdi-delete-outline"></v-btn>
                                        <div class="toggle-container">
                                          <v-checkbox
                                            v-model="field.useRepetitions"
                                            label="Use Repetitions"
                                            dense
                                          ></v-checkbox>
                                        </div>
                                      </v-col>
                                    </v-row>
                                  </div>
                                </div>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue-darken-1" variant="text" @click="modal = false">Close</v-btn>
                          <v-btn color="blue-darken-1" variant="text" type="submit">Save</v-btn>
                        </v-card-actions>
                      </v-card>
                    </form>
                  </v-dialog>
                  <div v-if="seanceStore.currentSeanceTrainings?.length">
                    <v-dialog scrollable v-model="modalEdit" persistent width="1024">
                      <template v-slot:activator="{ props }">
                        <v-btn color="primary" v-bind="props">Editer les trainings</v-btn>
                      </template>
                      <form enctype="multipart/form-data" @submit.prevent="editMyTraining">
                        <v-card height="80vh">
                          <v-card-title>
                            <span class="text-h5">Edition des entrainements de l'exercice du :{{seanceStore.currentSeance?.created_at}}</span>
                          </v-card-title>
                          <v-card-text>
                            <v-container>
                              <v-row>
                                <v-col cols="12">
                                  <div id="all-data" >
                                    <div v-for="(champ, index) in champs" :key="index" class="list-champ">
                                      <v-row>
                                        <v-col cols="3">
                                          <div class="trainingslist">
                                            <v-select
                                              v-model="champ.training"
                                              :items="trainingStore.trainings"
                                              item-title="name"
                                              item-value="id"
                                              label="Training"
                                              required
                                            ></v-select>
                                          </div>
                                        </v-col>
                                        <v-col cols="3">
                                          <div class="serietraining">
                                            <v-text-field v-model="champ.series" name="series[]" label="Series" type="number" dense outlined></v-text-field>
                                          </div>
                                        </v-col>
                                        <v-col cols="3">
                                          <div v-if="champ.useRepetitions" class="reptraining">
                                            <v-text-field v-model="champ.repetitions" name="repetitions[]" label="Repetitions" type="number" dense outlined></v-text-field>
                                          </div>
                                          <div v-else class="dureetraining">
                                            <v-text-field v-model="champ.duree" name="duree[]" label="Duration" type="number" dense outlined></v-text-field>
                                          </div>
                                        </v-col>
                                        <v-col cols="3" class="d-flex justify-content-center"><div class="toggle-container">
                                            <v-checkbox
                                              v-model="champ.useRepetitions"
                                              label="Use Repetitions"
                                              dense
                                            ></v-checkbox>
                                          </div>
                                        </v-col>
                                      </v-row>
                                    </div>
                                  </div>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="modalEdit = false">Close</v-btn>
                            <v-btn color="blue-darken-1" variant="text" type="submit">Save</v-btn>
                          </v-card-actions>
                        </v-card>
                      </form>
                    </v-dialog>
                  </div>
                </div>
              </div>
            </v-row>
          </v-col>
          <v-col cols="12" v-if="seanceStore.currentSeance">
            <v-row v-if="!seanceStore.currentSeance.coach_id">
              <v-col cols="6">
                <div v-if="seanceStore.currentSeance?.img_debut">
                  <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_debut}`" width="200px"></v-img>
                  <v-btn @click="supprChallengerDebut(seanceStore.currentSeance.id)">x</v-btn>
                </div>
                <div v-else-if="seanceStore.currentSeance?.img_debut == null">
                  <v-form enctype="multipart/form-data" @submit.prevent="changeChallengerDebut(seanceStore.currentSeance.id)">
                    <v-file-input @change="uploadChallengerDebut" show-size prepend-icon="mdi-camera" v-model="imageChallengerDebut" clearable label="ImageDebut"></v-file-input>
                    <v-btn type="submit">Mettre à jour</v-btn>
                  </v-form>
                </div>
              </v-col>
              <v-col cols="6">
                <div v-if="seanceStore.currentSeance?.img_fin">
                  <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/seance/${seanceStore.currentSeance.challenger_id}/${seanceStore.currentSeance.img_fin}`" width="200px"></v-img>
                  <v-btn @click="supprChallengerFin(seanceStore.currentSeance.id)">x</v-btn>
                </div>
                <div v-else-if="seanceStore.currentSeance?.img_fin == null">
                  <v-form enctype="multipart/form-data" @submit.prevent="changeChallengerFin(seanceStore.currentSeance.id)">
                    <v-file-input @change="uploadChallengerFin" show-size prepend-icon="mdi-camera" v-model="imageChallengerFin" clearable label="ImageFin"></v-file-input>
                    <v-btn type="submit">Mettre à jour</v-btn>
                  </v-form>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <div v-if="seanceStore.currentSeance">
          <div>
            <p>Date : {{seanceStore.dateTime(seanceStore.currentSeance.created_at)}}</p>
            <p>Heure: {{seanceStore.hourTime(seanceStore.currentSeance.created_at)}}</p>
          </div>
          <p v-if="seanceStore.currentSeanceCoach">Coaché par: {{seanceStore.currentSeanceCoach?.name}}</p>
          <div>Trainings:
            <v-sheet height="100px" class="mb-3 pr-5" style="display: flex !important; justify-content: space-between; align-items: center; overflow: hidden;" rounded elevation="10" v-for="(kotrana, index) in seanceStore.currentSeanceTrainings" :key="index">
              <div v-if="kotrana.image">
                <v-img :src="`${APP_CONFIG.STORAGE_BASE_URL}/trainings/${kotrana.image}`" width="140px" height="100px" class="img-train" cover></v-img>
              </div>
              <p class="ml-5">{{kotrana.name}}</p>
              <div>
                <span class="mx-3">{{kotrana.pivot.series}} <b>Séries</b></span>
                <span class="mx-3">{{kotrana.pivot.repetitions || 0}} <b>Répétition</b></span>
                <span class="mx-3">{{kotrana.pivot.duree || 0}} <b>durée</b></span>
              </div>
              <div v-if="!seanceStore.currentSeanceCoach">
                <v-btn variant="outlined" icon="mdi-delete" @click="supprTraining(kotrana.pivot.seance_id, kotrana.pivot.training_id, kotrana.pivot.id)">
                </v-btn>
              </div>
              <div v-if="seanceStore.currentSeanceCoach">
                <v-btn icon="mdi-lock" disabled>
                </v-btn>
              </div>
            </v-sheet>
          </div>
        </div>
      </v-col>

      <v-col
        cols="12"
        sm="4"
      >
        <v-sheet
          rounded="lg"
          min-height="268"
        >
          <h5>Pourcentage:</h5>
          <li v-for="(c , nom) in seanceStore.counts" :key="nom">
            <p>{{nom}} : {{c}}</p>
          </li>
          <div ref="container" id="votre-container"></div>
          <canvas ref="doughnutChart"></canvas>
          <div id="custom-legend"></div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { useAuthStore } from '../../../store/AuthStore'
import { defineComponent, ref, reactive, toRefs , watch, onMounted } from 'vue'
import { useSeanceStore } from '../../../store/ChallengerStore/SeanceStore'
import { useTrainingStore } from '../../../store/ChallengerStore/TrainingStore'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Chart, registerables } from 'chart.js';
import { APP_CONFIG } from '../../../config/constants'

export default defineComponent({
  setup(){
    // Configuration centralisée des URLs
    const ASSETS_BASE_URL = window.location.origin
    const GLTF_MODEL_PATH = `${ASSETS_BASE_URL}/src/assets/Muscle.gltf`
    
    const AuthStore = useAuthStore()
    AuthStore.getUserAuth()
    const dialog = ref(false)
    const modalEdit = ref(false)
    const modal = ref(false)
    const seanceStore = useSeanceStore()
    const trainingStore = useTrainingStore()
    trainingStore.getTrainings()
    seanceStore.seances = null
    seanceStore.currentSeance = null
    seanceStore.currentSeanceTrainings = null
    seanceStore.counts = {}
    seanceStore.getSeances()
    //Debut
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor('#EEEEEE')
    const container = ref<HTMLDivElement | null>(null);
    
    // Nouvelle scène pour le dialog de création
    const createScene = new THREE.Scene();
    const createCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const createRenderer = new THREE.WebGLRenderer();
    createRenderer.setClearColor('#EEEEEE')
    const createContainer = ref<HTMLDivElement | null>(null);
    const createGltf = ref<any>(null)
    const createLoader = new GLTFLoader();
    const originalMaterials = new Map<string, number>(); // Stocker les couleurs originales
    
    const doughnutChart = ref<HTMLCanvasElement | null>(null);
    let chartInstance : any;
    const chartData = ref<{
      labels: string[];
      datasets: { data: number[]; backgroundColor: string[] }[];
    }>({
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
      }],
    });
    const loader = new GLTFLoader();

    const gltf = ref<any>(null)
    const originalMainMaterials = new Map<string, number>(); // Stocker les couleurs originales de la scène principale
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25; // inertia
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    
    // Controls pour la scène de création
    const createControls = new OrbitControls(createCamera, createRenderer.domElement);
    createControls.enableDamping = true;
    createControls.dampingFactor = 0.25;
    createControls.screenSpacePanning = false;
    createControls.maxPolarAngle = Math.PI;

    const init = () => {
      //camera.position.z = 3;
      camera.position.z = 7;
      const light1 = new THREE.AmbientLight(0xFFFFFF)
      const light2 = new THREE.DirectionalLight(0xFFFFFF, 5.0)
      light1.position.set(100,100,100)
      const lightx = new THREE.PointLight(0xFF0000, 1, 500)
      lightx.position.set(10, 0, 25)
      scene.add(lightx)
      scene.add(light1)
      scene.add(light2)

      loader.load(GLTF_MODEL_PATH, (loadedGltf : any) => {
        gltf.value = loadedGltf
        console.log(loadedGltf.scene)
        
        // Sauvegarder les couleurs originales des matériaux pour la scène principale
        loadedGltf.scene.traverse((child: any) => {
          if (child.isMesh && child.material && child.name) {
            originalMainMaterials.set(child.name, child.material.color.getHex());
          }
        });
        console.log('Couleurs originales sauvegardées (scène principale):', Array.from(originalMainMaterials.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));
        
        //loadedGltf.scene.getObjectByName('Biceps').material.color.setHex(0xFF0000)
        //loadedGltf.scene.getObjectByName('Triceps').material.color.setHex(0x0000FF)
        //loadedGltf.scene.position.set(0, 1, -5)
        scene.add(loadedGltf.scene);
      });

      //renderer.setSize(window.innerWidth, window.innerHeight);
      if(container.value){
        const rect = container.value.getBoundingClientRect()
        const width = rect.width
        renderer.setSize(width, window.innerHeight);
        camera.aspect = width / window.innerHeight;
        camera.updateProjectionMatrix()
      }
      if (container.value) {
        container.value.appendChild(renderer.domElement);
      }
    };
    
    // Initialisation de la scène de création
    const initCreateScene = () => {
      if (!createContainer.value) return;
      
      createCamera.position.z = 7;
      const light1 = new THREE.AmbientLight(0xFFFFFF)
      const light2 = new THREE.DirectionalLight(0xFFFFFF, 5.0)
      light1.position.set(100,100,100)
      const lightx = new THREE.PointLight(0xFF0000, 1, 500)
      lightx.position.set(10, 0, 25)
      createScene.add(lightx)
      createScene.add(light1)
      createScene.add(light2)

      createLoader.load(GLTF_MODEL_PATH, (loadedGltf : any) => {
        createGltf.value = loadedGltf
        console.log('Create scene - model loaded:', loadedGltf.scene)
        
        // Sauvegarder les couleurs originales des matériaux
        loadedGltf.scene.traverse((child: any) => {
          if (child.isMesh && child.material && child.name) {
            originalMaterials.set(child.name, child.material.color.getHex());
          }
        });
        console.log('Couleurs originales sauvegardées:', Array.from(originalMaterials.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));
        
        createScene.add(loadedGltf.scene);
      });

      // Définir une taille fixe pour le conteneur de création
      const width = 350; // Largeur fixe
      const height = 300; // Hauteur fixe
      createRenderer.setSize(width, height);
      createCamera.aspect = width / height;
      createCamera.updateProjectionMatrix()
      
      if (createContainer.value) {
        createContainer.value.appendChild(createRenderer.domElement);
        console.log('Create scene initialized and added to DOM');
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      if(gltf.value && gltf.value.scene){
        gltf.value.scene.rotation.y += 0.003
      }
      if(createGltf.value && createGltf.value.scene){
        createGltf.value.scene.rotation.y += 0.003
      }
      controls.update();
      createControls.update();
      renderer.render(scene, camera);
      createRenderer.render(createScene, createCamera);
    };

    onMounted(() => {
      // Ajouter des modules Chart.js nécessaires
      Chart.register(...registerables);

      // Initialisation du graphique
      const ctx = doughnutChart.value?.getContext('2d');
      if (ctx) {
        chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: chartData.value,
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  boxWidth: 15,
                  padding: 10
                }
              }
            }
          },
        });
      }
      init();
      animate();
    });
    //FIN

    const show = async (id: number) => {
      //camera.position.z = 3;
      camera.position.z = 7;
      const light1 = new THREE.AmbientLight(0xFFFFFF)
      const light2 = new THREE.DirectionalLight(0xFFFFFF, 5.0)
      light1.position.set(100,100,100)
      const lightx = new THREE.PointLight(0xFF0000, 1, 500)
      lightx.position.set(10, 0, 25)

      await seanceStore.showSeance(id);
      const seanceTrainings = await seanceStore.currentSeanceTrainings;
      if (seanceTrainings) {
        champs.length = seanceTrainings.length;
        for (let i = 0; i < seanceTrainings.length; i++) {
          champs[i] = {
            training: seanceTrainings[i].pivot.training_id,
            series: seanceTrainings[i].pivot.series || 0,
            repetitions: seanceTrainings[i].pivot.repetitions || 0,
            duree: seanceTrainings[i].pivot.duree || 0,
            useRepetitions: (seanceTrainings[i].pivot.repetitions > 0) ? true : false,
          };
        }
      }
      
      loader.load(GLTF_MODEL_PATH, (loadedGltf : any) => {
        gltf.value = loadedGltf
        console.log(loadedGltf.scene)
        
        // Sauvegarder les couleurs originales si pas encore fait
        if (originalMainMaterials.size === 0) {
          loadedGltf.scene.traverse((child: any) => {
            if (child.isMesh && child.material && child.name) {
              originalMainMaterials.set(child.name, child.material.color.getHex());
            }
          });
        }
        
        // Nouvelle logique : compter les muscles selon les exercices de la séance
        const muscleCount = new Map<string, number>();
        
        seanceTrainings?.forEach((training: any) => {
          if (training.categories) {
            training.categories.forEach((category: any) => {
              if (category.name) {
                muscleCount.set(category.name, (muscleCount.get(category.name) || 0) + 1);
              }
            });
          }
        });
        
        // Réinitialiser les muscles à leur couleur originale
        loadedGltf.scene.traverse((child: any) => {
          if (child.isMesh && child.material && child.name) {
            if (originalMainMaterials.has(child.name)) {
              child.material.color.setHex(originalMainMaterials.get(child.name));
            }
          }
        });
        
        // Colorer les muscles selon l'intensité (même logique que updateCreateSceneMuscles)
        muscleCount.forEach((count, muscleName) => {
          if (loadedGltf.scene.getObjectByName(muscleName)) {
            // Système de couleurs rouge exact : 1+, 3+, 5+
            let color = 0xFF4545; // Rouge clair pour 1+ exercice
            if (count >= 5) {
              color = 0xBF0000; // Rouge très foncé pour 5+ exercices
            } else if (count >= 3) {
              color = 0xE61F1F; // Rouge foncé pour 3+ exercices
            }
            
            loadedGltf.scene.getObjectByName(muscleName).material.color.setHex(color);
            console.log(`Muscle coloré (scène principale): ${muscleName} (${count} exercice(s)) - Couleur: #${color.toString(16)}`);
          }
        });
        
        console.log('Muscles ciblés dans la séance:', Array.from(muscleCount.keys()));
        console.log('Intensités des muscles:', Array.from(muscleCount.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));
        
        scene.clear()
        scene.add(lightx)
        scene.add(light1)
        scene.add(light2)
        scene.add(loadedGltf.scene);
      });
      
      console.log(champs);
      chartData.value.labels = Object.keys(seanceStore.counts);
      chartData.value.datasets[0].data = Object.values(seanceStore.counts);
      chartData.value.datasets[0].backgroundColor = ['#6A1B9A', '#283593', '#00838F', '#00695C', '#2E7D32', '#689F38', '#C0CA33', '#FBC02D']; // Changez cela selon vos besoins
      chartInstance.update()
    }

    // Fonction pour mettre à jour la scène 3D de création quand on sélectionne un exercice
    const onTrainingChange = async (trainingId: number) => {
      updateCreateSceneMuscles();
    };

    // Fonction pour mettre à jour tous les muscles selon tous les exercices sélectionnés
    const updateCreateSceneMuscles = () => {
      if (!createGltf.value) return;
      
      // Collecter tous les muscles ciblés avec comptage
      const muscleCount = new Map<string, number>();
      
      inputs.value.forEach(input => {
        if (input.training) {
          const selectedTraining = trainingStore.trainings.find((training: any) => training.id === input.training);
          if (selectedTraining && selectedTraining.categories) {
            selectedTraining.categories.forEach((category: any) => {
              if (category.name) {
                muscleCount.set(category.name, (muscleCount.get(category.name) || 0) + 1);
              }
            });
          }
        }
      });
      
      // Réinitialiser SEULEMENT les muscles à leur couleur par défaut, pas tout l'objet
      createGltf.value.scene.traverse((child: any) => {
        if (child.isMesh && child.material && child.name) {
          // Si c'est un muscle qui était ciblé, on le remet à sa couleur originale
          if (originalMaterials.has(child.name)) {
            child.material.color.setHex(originalMaterials.get(child.name));
          }
        }
      });
      
      // Colorer tous les muscles ciblés avec le nouveau système de couleurs
      muscleCount.forEach((count, muscleName) => {
        if (createGltf.value.scene.getObjectByName(muscleName)) {
          // Système de couleurs rouge exact : 1+, 3+, 5+
          let color = 0xFF4545; // Rouge clair pour 1+ exercice
          if (count >= 5) {
            color = 0xBF0000; // Rouge très foncé pour 5+ exercices
          } else if (count >= 3) {
            color = 0xE61F1F; // Rouge foncé pour 3+ exercices
          }
          
          createGltf.value.scene.getObjectByName(muscleName).material.color.setHex(color);
          console.log(`Muscle coloré: ${muscleName} (${count} exercice(s)) - Couleur: #${color.toString(16)}`);
        }
      });
      
      console.log('Muscles ciblés au total:', Array.from(muscleCount.keys()));
      console.log('Détail des intensités:', Array.from(muscleCount.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}));
    };

    // Watcher pour initialiser la scène de création quand le dialog s'ouvre
    watch(dialog, (newVal) => {
      if (newVal) {
        // Utiliser nextTick pour s'assurer que le DOM est rendu
        setTimeout(() => {
          if (createContainer.value) {
            // Vérifier si la scène n'est pas déjà initialisée
            if (!createContainer.value.hasChildNodes()) {
              initCreateScene();
            }
          }
        }, 200); // Délai un peu plus long pour s'assurer que le DOM est rendu
      }
    });

    const data = ref([])
    const counts = ({})
    const inputs = ref([
      {
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      },
    ]);

    function addInput() {
      inputs.value.push({
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      });
    }

    function deleteInput(index: number) {
      inputs.value.splice(index, 1);
      // Mettre à jour la scène 3D après suppression
      setTimeout(() => {
        updateCreateSceneMuscles();
      }, 100);
    }

    const state = reactive({
      imageDebut:  null as null | any,
      saryDebut: null as null | any,
      imageFin:  null as null | any,
      saryFin: null as null | any,
      imageChallengerDebut:  null as null | any,
      saryChallengerDebut: null as null | any,
      imageChallengerFin:  null as null | any,
      saryChallengerFin: null as null | any,
    })

    const uploadChallengerDebut = (e: any) => {
      state.saryChallengerDebut = e.target.files[0]
    }

    const changeChallengerDebut = (id : number) => {
      seanceStore.updateChallengerDebut(id, state.saryChallengerDebut)
    }

    const supprChallengerDebut = (id : number) => {
      seanceStore.supprChallengerDebut(id, {
        suppr: null
      })
    }

    const uploadChallengerFin = (e: any) => {
      state.saryChallengerFin = e.target.files[0]
    }

    const changeChallengerFin = (id : number) => {
      seanceStore.updateChallengerFin(id, state.saryChallengerFin)
    }

    const supprChallengerFin = (id : number) => {
      seanceStore.supprChallengerFin(id, {
        suppr: null
      })
    }

    const uploadDebut = (e: any) => {
      state.saryDebut = e.target.files[0]
    }

    watch(
      [() => seanceStore.message, () => modal.value,],
      ([newMessage, modalValue]) => {
        if (newMessage !== '') {
          seanceStore.getSeances()
          seanceStore.message = '';
        }
        if(modalValue == false){
          fields.value = [
            {
              training: null,
              series: '',
              repetitions: '',
              duree: '',
              useRepetitions: true,
            },
          ]
        }
        if(seanceStore.currentSeance?.id){
          //seanceStore.showSeance(seanceStore.currentSeance.id)
          show(seanceStore.currentSeance.id)
        }
      }
    );

    const uploadFin = (e: any) => {
      state.saryDebut = e.target.files[0]
    }

    function supprTraining(seanceId :number, trainingId :number, pivotId :number) {
      seanceStore.supprTraining(seanceId, trainingId, pivotId)
    }

    const createSeance = () => {
      dialog.value = false
      const data = {
        traininglist: inputs.value.map((input) => Number(input.training)),
        series: inputs.value.map((input) => Number(input.series) || null),
        repetitions: inputs.value.map((input) => (input.useRepetitions ? Number(input.repetitions) : 0)),
        duree: inputs.value.map((input) => (!input.useRepetitions ? Number(input.duree) : 0)),
      };
      seanceStore.create(data, state.saryDebut, state.saryFin)
    }

    const fields = ref([
      {
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      },
    ]);

    const champs = reactive([{
      training: null,
      series: null,
      repetitions: null,
      duree: null,
      useRepetitions: true,
    }]);

    function addField() {
      fields.value.push({
        training: null,
        series: '',
        repetitions: '',
        duree: '',
        useRepetitions: true,
      });
    }

    function deleteField(index: number) {
      fields.value.splice(index, 1);
    }

    const addTraining = () => {
      modal.value = false
      const data = {
        traininglist: fields.value.map((field) => Number(field.training)),
        series: fields.value.map((field) => Number(field.series) || 0),
        repetitions: fields.value.map((field) => (field.useRepetitions ? Number(field.repetitions) : 0)),
        duree: fields.value.map((field) => (!field.useRepetitions ? Number(field.duree) : 0)),
      };
      if(seanceStore.currentSeance){
        if(seanceStore.currentSeance.id){
          seanceStore.addTraining(seanceStore.currentSeance.id, data)
        }
      }
    }

    const editMyTraining = () => {
      modalEdit.value = false
      const data = {
        traininglist: champs.map((x) => Number(x.training)),
        series: champs.map((x) => Number(x.series)),
        repetitions: champs.map((x) => (x.repetitions == '' || x.repetitions == 0) ? 0 : Number(x.repetitions)),
        duree: champs.map((x) => (x.duree == '' || x.duree == 0) ? 0 : Number(x.duree)),
      };
      seanceStore.editMyTraining(seanceStore.currentSeance.id, data)
    }

    const deleteSeance = (id : number) => {
      seanceStore.deleteSeance(id)
      seanceStore.currentSeance = null
      seanceStore.currentSeanceAdmin = null
      seanceStore.currentSeanceCoach = null
      seanceStore.currentSeanceChallenger = null
      seanceStore.counts = null
    }

    const confirmer = (id) => {
      seanceStore.confirmer(id)
    }

    const decliner = (id) => {
      seanceStore.decliner(id)
    }

    return {
      chartData,
      doughnutChart,
      confirmer,
      decliner,
      AuthStore,
      seanceStore,
      trainingStore,
      show,
      uploadDebut,
      uploadFin,
      supprTraining,
      addTraining,
      createSeance,
      addInput,
      deleteInput,
      dialog,
      modal,
      modalEdit,
      ...toRefs(champs),
      inputs,
      fields,
      champs,
      addField,
      deleteField,
      data,
      counts,
      editMyTraining,
      deleteSeance,
      uploadChallengerDebut,
      changeChallengerDebut,
      supprChallengerDebut,
      uploadChallengerFin,
      changeChallengerFin,
      supprChallengerFin,
      container,
      createContainer,
      onTrainingChange,
      ...toRefs(state)
    }
  }
})
</script>
<style scoped>
  .v-avatar.primary{
    border: 5px solid #3172c3;
  }
  .v-avatar.pink{
    border: 5px solid #ea476b;
  }
  .img-train img{
    width: 100px;
    height: 100%;
  }
  #container {
    position: relative;
  }
  #create-container {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f5f5f5;
  }
  #custom-legend {
    display: flex;
    flex-direction: row;
  }
  #custom-legend > div{
    width: 100% !important;
  }

  .legend-item {
    width: 100%;
    margin-right: 10px;
    display: flex;
    align-items: center;
  }

  .legend-item span {
    display: inline-block;
    width: 80px; /* Ajustez la largeur de la boîte de couleur */
    height: 15px; /* Ajustez la hauteur de la boîte de couleur */
    margin-right: 5px;
  }
</style>
