import mongoose, {
  Document,
  Model,
  // CallbackWithoutResultAndOptionalError,
} from "mongoose"
import bcrypt from "bcryptjs"

// 1. Define the TypeScript interface mapping out ALL your schema fields
export interface IUser extends Document {
  firstName: string
  middleName?: string
  lastName: string
  class?: string
  email: string
  role: "user" | "admin"
  phone: string
  password: string
  terms: boolean
  isVerified: boolean // Added
  verificationToken?: string // Added
  verificationTokenExpires?: Date // Added
  confirmPassword?: string // Added for virtual support
  _confirmPassword?: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

// 2. Pass <IUser> into the Schema generic constructor
const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true },
    class: { type: String, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    terms: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // Added to schema
    verificationToken: { type: String }, // Added to schema
    verificationTokenExpires: { type: Date }, // Added to schema
  },
  { timestamps: true }
)

// (Keep your virtuals and pre-save hooks down here exactly as they were...)
UserSchema.virtual("confirmPassword")
  .set(function (value) {
    this._confirmPassword = value
  })
  .get(function () {
    return this._confirmPassword
  })

// 1. Password Confirmation Check
UserSchema.pre(
  "save",
  { document: true, query: true },
  function (this: IUser, next: any) {
    if (this.isModified("password")) {
      if (!this.confirmPassword) {
        this.invalidate("confirmPassword", "Please confirm your password.")
      }
      if (this.password !== this.confirmPassword) {
        this.invalidate("confirmPassword", "Passwords do not match.")
      }
    }
    next()
  }
)

// 2. Password Hashing Process
UserSchema.pre(
  "save",
  { document: true, query: true },
  async function (this: IUser, next: any) {
    if (!this.isModified("password")) return next()
    try {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
      next()
    } catch (error) {
      next(error as Error)
    }
  }
)

// Custom method to check password validity
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// 3. Bind the Interface to the final export Model structure
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema)

export default User
