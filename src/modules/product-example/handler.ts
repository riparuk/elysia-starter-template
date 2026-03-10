import { Elysia, t } from 'elysia'

import { ProductExampleService } from './service'
import { ProductExampleModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { buildPaginationMeta } from '../../core/pagination'
import { authMiddleware } from '../../middleware/auth-middleware'

export const productExampleHandler = new Elysia({
	prefix: '/product-examples',
	tags: ['Product Example']
})
	// Auth middleware
	.use(authMiddleware)

	// GET /product-examples — list with pagination
	.get(
		'/',
		async ({ query, path }) => {
			const { data, totalItems, pagination } =
				await ProductExampleService.getAll(query)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAdmin: true, // need admin role
			query: ProductExampleModel.ProductExampleQuery,
			response: FormatResponseSchema(
				t.Array(ProductExampleModel.ProductExampleWithUserResponse)
			)
		}
	)

	// GET /product-examples/:id — single product
	.get(
		'/:id',
		async ({ params: { id }, path }) => {
			const data = await ProductExampleService.getById(id)
			return formatResponse({ path, data })
		},
		{
			params: t.Object({ id: t.String() }),
			response: FormatResponseSchema(
				ProductExampleModel.ProductExampleWithUserResponse
			)
		}
	)

	// GET /product-examples/my-product-examples — list with pagination
	.get(
		'/my-product-examples',
		async ({ query, path, user }) => {
			const { data, totalItems, pagination } =
				await ProductExampleService.getAllMyProducts(query, user?.id)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true, // need auth role
			query: ProductExampleModel.ProductExampleQuery,
			response: FormatResponseSchema(
				t.Array(ProductExampleModel.ProductExampleResponse)
			)
		}
	)

	// POST /product-examples — create
	.post(
		'/',
		async ({ body, path, user }) => {
			const data = await ProductExampleService.create(body, user?.id)
			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Product created'
			})
		},
		{
			requireAuth: true, // need auth role
			body: ProductExampleModel.ProductExampleInputCreate,
			response: FormatResponseSchema(
				ProductExampleModel.ProductExampleResponse
			)
		}
	)

	// PATCH /product-examples/:id — update
	.patch(
		'/:id',
		async ({ params: { id }, body, path, user }) => {
			const data = await ProductExampleService.update(id, body, user?.id)
			return formatResponse({ path, data, message: 'Product updated' })
		},
		{
			requireAuth: true, // need auth role
			params: t.Object({ id: t.String() }),
			body: ProductExampleModel.ProductExampleInputUpdate,
			response: FormatResponseSchema(
				ProductExampleModel.ProductExampleResponse
			)
		}
	)

	// DELETE /product-examples/:id — delete
	.delete(
		'/:id',
		async ({ params: { id }, path, user }) => {
			const data = await ProductExampleService.delete(id, user?.id)
			return formatResponse({ path, data, message: 'Product deleted' })
		},
		{
			requireAuth: true, // need auth role
			params: t.Object({ id: t.String() }),
			response: FormatResponseSchema(
				ProductExampleModel.ProductExampleResponse
			)
		}
	)
