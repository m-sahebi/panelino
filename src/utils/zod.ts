import { ZodObject, ZodRawShape, z } from 'zod';

// export function zOmit<TSchema extends ZodRawShape>(
//   schema: ZodObject<TSchema>,
//   keys: { [key in keyof TSchema]?: true | undefined }
// ) {
//   return schema.omit(keys);
// }
//
// export function zPick(
//   schema: ZodObject<any>,
//   keys: { [key: string]: true | undefined }
// ) {
//   return schema.pick(keys);
// }

export function zNoMeta<TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>
) {
  return schema.omit({ updatedAt: true, createdAt: true, deletedAt: true });
}

export function zNoId(schema: ZodObject<any>) {
  return schema.omit({ id: true });
}

export function zNoIdAndMeta(schema: ZodObject<any>) {
  return zNoId(zNoMeta(schema));
}

export const ZPaginated = z
  .object({
    offset: z.coerce.number().min(0).default(0),
    limit: z.coerce.number().min(1).max(100).default(10),
    page: z.coerce.number().min(0).optional(),
    page_size: z.coerce.number().min(1).optional(),
  })
  .transform((v) => ({
    ...v,
    offset: v.page ? (v.page - 1) * (v.page_size || 10) : v.offset,
    limit: v.page_size,
  }));
