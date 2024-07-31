import mongoose, { Schema } from "mongoose";

const explensesSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        fixedExpenditure: {
            type: Number,
            required: true
        },
        variableExpenditure: {
            type: Number,
            required: true
        },
        completed: { 
            type: Boolean, 
            required: true 
        },
    }
)

export const Expenses = mongoose.model("Expenses", explensesSchema);