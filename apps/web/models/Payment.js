import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    amount: Number,

    method: String,

  items: [
    {
        title: String,

        amount: Number,

        installmentPercent: Number,

        payableAmount: {
            type: Number,
            default: 0,
        },

        outstandingAmount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["PAID", "PARTIAL", "UNPAID"],
            default: "UNPAID",
        },
    },
],

    status: {
      type: String,
      default: "SUCCESS",
    },

    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);