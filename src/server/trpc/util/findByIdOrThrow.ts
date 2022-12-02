export interface SelectArgs {
  where: {
    id: string;
  };
}

export interface LookupSchema<T> {
  findFirstOrThrow(args: SelectArgs): Promise<T>;
}

/**
 * Find an element by its id or throw a `NotFoundError` if it does not exist
 */
export default async function findByIdOrThrow<T>(
  collection: LookupSchema<T>,
  id: string
) {
  return await collection.findFirstOrThrow({
    where: {
      id,
    },
  });
}
