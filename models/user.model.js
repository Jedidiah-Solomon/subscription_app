import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "User Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 8,
      validate: {
        validator: function (v) {
          const hasNumber = /\d/.test(v);
          const hasUppercase = /[A-Z]/.test(v);
          const hasLowercase = /[a-z]/.test(v);
          const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
          return (
            v.length >= 8 &&
            hasNumber &&
            hasUppercase &&
            hasLowercase &&
            hasSymbol
          );
        },
        message:
          "Password must be at least 8 characters long and contain at least one number, one uppercase letter, one lowercase letter, and one symbol.",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
