import * as yup from "yup";

export const userSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be atleast of 3 characters")
    .required("Username is required"),

  email: yup
    .string()
    .email("The email is not valid one")
    .required("Email is required"),

  number: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),

  password: yup
    .string()
    .min(4, "Password must be atleast 4 characters")
    .required("Password is required"),
});

export const validateUser = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(400).json({ errors: err.errors });
  }
};
