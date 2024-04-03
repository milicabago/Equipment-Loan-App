// Provjera korisničke uloge - middleware
const checkUserRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403);
      throw new Error("You don't have access!");
    }
  };
};
