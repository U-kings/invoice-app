import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        class: {
            type: [String], // Array of class names
            required: true,
            default: [],
        },

        description: {
            type: String,
        },

        dueDate: {
            type: Date,
        },

        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Item ||
    mongoose.model("Item", ItemSchema);