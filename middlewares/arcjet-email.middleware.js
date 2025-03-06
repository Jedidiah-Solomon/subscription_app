import ajEmail from "../config/arcjetEmail.js";

const arcjetEmailMiddleware = async (req, res, next) => {
  try {
    const email = req.body?.email || req.query?.email;

    const decision = await ajEmail.protect(req, { email });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        return res.status(400).json({ error: "Invalid email" });
      }

      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    console.log(`Arcjet Email Middleware Error: ${error}`);
    next(error);
  }
};

export default arcjetEmailMiddleware;
