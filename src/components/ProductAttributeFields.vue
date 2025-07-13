<template>
  <div class="product-attributes">
    <v-divider class="mb-4"></v-divider>
    <h3 class="text-h6 mb-4">
      <v-icon class="mr-2">mdi-tune</v-icon>
      Attributs du produit
    </h3>
    
    <v-row v-if="attributes.length > 0">
      <v-col 
        v-for="attribute in attributes" 
        :key="attribute.id"
        cols="12" 
        :md="getColumnSize(attribute.type)"
      >
        <!-- Text Field -->
        <v-text-field
          v-if="attribute.type === 'text'"
          v-model="attributeValues[attribute.id]"
          :label="attribute.name"
          :suffix="attribute.unit"
          variant="outlined"
          density="comfortable"
          :required="attribute.is_required"
          :rules="attribute.is_required ? [rules.required] : []"
        ></v-text-field>

        <!-- Number Field -->
        <v-text-field
          v-else-if="attribute.type === 'number'"
          v-model="attributeValues[attribute.id]"
          :label="attribute.name"
          :suffix="attribute.unit"
          type="number"
          variant="outlined"
          density="comfortable"
          :required="attribute.is_required"
          :rules="attribute.is_required ? [rules.required, rules.number] : [rules.number]"
        ></v-text-field>

        <!-- Select Field -->
        <v-select
          v-else-if="attribute.type === 'select' && attribute.options"
          v-model="attributeValues[attribute.id]"
          :items="attribute.options"
          :label="attribute.name"
          variant="outlined"
          density="comfortable"
          :required="attribute.is_required"
          :rules="attribute.is_required ? [rules.required] : []"
        ></v-select>

        <!-- Color Field -->
        <div v-else-if="attribute.type === 'color'" class="color-field">
          <v-text-field
            v-model="attributeValues[attribute.id]"
            :label="attribute.name"
            variant="outlined"
            density="comfortable"
            :required="attribute.is_required"
            :rules="attribute.is_required ? [rules.required, rules.color] : [rules.color]"
          >
            <template v-slot:append-inner>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <div
                    v-bind="props"
                    class="color-preview"
                    :style="{ backgroundColor: attributeValues[attribute.id] || '#ffffff' }"
                  ></div>
                </template>
                <v-color-picker
                  v-model="attributeValues[attribute.id]"
                  mode="hex"
                  hide-inputs
                ></v-color-picker>
              </v-menu>
            </template>
          </v-text-field>
        </div>

        <!-- Required indicator -->
        <div v-if="attribute.is_required" class="text-caption text-error mt-1">
          * Champ obligatoire
        </div>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal" class="mb-4">
      <v-icon start>mdi-information</v-icon>
      Aucun attribut configuré pour ce type de produit.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'select' | 'number' | 'color';
  options?: string[] | null;
  unit?: string | null;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  attributes: ProductAttribute[]
  modelValue: { [key: number]: string }
}

interface Emits {
  (e: 'update:modelValue', value: { [key: number]: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const attributeValues = ref<{ [key: number]: string }>({ ...props.modelValue })

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Ce champ est requis',
  number: (value: string) => !value || !isNaN(Number(value)) || 'Doit être un nombre valide',
  color: (value: string) => !value || /^#[0-9A-F]{6}$/i.test(value) || 'Format de couleur invalide (ex: #FF0000)'
}

// Watch for changes and emit
watch(attributeValues, (newValues) => {
  emit('update:modelValue', newValues)
}, { deep: true })

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  attributeValues.value = { ...newValue }
}, { deep: true })

// Watch for attributes changes to reset values
watch(() => props.attributes, (newAttributes) => {
  const newValues: { [key: number]: string } = {}
  newAttributes.forEach(attr => {
    newValues[attr.id] = attributeValues.value[attr.id] || ''
  })
  attributeValues.value = newValues
}, { deep: true })

const getColumnSize = (type: string) => {
  switch (type) {
    case 'color':
      return 6
    case 'select':
      return 6
    case 'number':
      return 4
    default:
      return 6
  }
}
</script>

<script lang="ts">
export default {
  name: 'ProductAttributeFields'
}
</script>

<style scoped>
.product-attributes {
  margin-top: 16px;
}

.color-field {
  position: relative;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preview:hover {
  transform: scale(1.1);
}
</style> 