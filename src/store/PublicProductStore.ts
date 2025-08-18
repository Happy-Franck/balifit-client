import { defineStore } from 'pinia'
import http from '@/axios'
import Product from '@/types/Product'

export const usePublicProductStore = defineStore('publicProducts', {
	state: () => ({
		message: '',
		products: [] as Product[],
		productTypes: [] as any[],
		loading: false,
		loadingProduct: false,
		currentProduct: null as Product | null,
		alert: false,
		totalProductsCount: 0,
		pagination: {
			current_page: 1,
			per_page: 10,
			total: 0,
			last_page: 1
		}
	}),
	actions: {
		async getProductTypes() {
			try {
				const { data } = await http.get('/shop/product-types')
				this.productTypes = data.product_types || []
				// Essayer d'estimer le total à partir des counts si disponible
				const sum = this.productTypes.reduce((acc: number, t: any) => acc + (t.active_produits_count || t.produits_count || 0), 0)
				if (sum > 0) this.totalProductsCount = sum
			} catch (e) {
				this.productTypes = []
			}
		},
		async getProducts(
			page: number = 1,
			search: string = '',
			productTypeId: number | null = null,
			minPrice: number | null = null,
			maxPrice: number | null = null,
			sortBy: string | null = null,
			perPage: number = 10
		) {
			try {
				this.loading = true
				const params: any = { page, per_page: perPage }
				if (search) params.search = search
				if (minPrice !== null) params.min_price = minPrice
				if (maxPrice !== null) params.max_price = maxPrice
				if (sortBy) {
					// Mapper le tri UI vers colonnes API
					const map: any = {
						'price-asc': { sort_by: 'price', sort_order: 'asc' },
						'price-desc': { sort_by: 'price', sort_order: 'desc' },
						'name-asc': { sort_by: 'name', sort_order: 'asc' },
						'name-desc': { sort_by: 'name', sort_order: 'desc' },
						'popularity': { sort_by: 'id', sort_order: 'desc' },
					}
					Object.assign(params, map[sortBy] || {})
				}
				const { data } = await http.get('/shop/products', { params })
				let list: Product[] = data.data || data.products || data || []
				// Filtre client-side par type si demandé (l'API publique ne le supporte pas encore)
				if (productTypeId !== null) {
					list = list.filter((p: any) => p.product_type_id === productTypeId)
				}
				this.products = list
				this.pagination = {
					current_page: data.current_page || page,
					per_page: data.per_page || perPage,
					total: data.total || list.length,
					last_page: data.last_page || 1
				}
				this.totalProductsCount = data.total || this.totalProductsCount || list.length
			} catch (e) {
				this.message = 'Erreur lors du chargement des produits'
				this.alert = true
			} finally {
				this.loading = false
			}
		},
		async showProduct(id: number) {
			try {
				this.loadingProduct = true
				const { data } = await http.get(`/shop/products/${id}`)
				this.currentProduct = data.produit || data.product || data
			} catch (e) {
				this.message = 'Erreur lors du chargement du produit'
				this.alert = true
				this.currentProduct = null
			} finally {
				this.loadingProduct = false
			}
		}
	}
}) 