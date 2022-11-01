export const isOwner = (userId: number, ownerId: number) => {
  return userId === ownerId;
};
