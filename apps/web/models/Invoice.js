import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    invoiceNumber: {
      type: String,
      unique: true,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
    },

    totalOutstanding: {
      type: Number,
      default: 0,
    },

    items: [
      {
        title: String,

        amount: Number,

        payableAmount: {
          type: Number,
          default: 0,
        },

        outstandingAmount: {
          type: Number,
          default: 0,
        },

        installmentPercent: Number,

        status: {
          type: String,
          enum: ["PAID", "PARTIAL", "UNPAID"],
          default: "UNPAID",
        },
      },
    ],

    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "PARTIAL",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Invoice ||
mongoose.model("Invoice", InvoiceSchema);