
export const isUserEqual = (a, b) => {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.email === b.email &&
    a.password === b.password &&
    a.role === b.role &&
    a.state === b.state &&
    a.image_file === b.image_file
  );
};
