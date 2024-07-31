import mongoose, { Schema } from "mongoose";

const financialGoalsSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        goalType: {
            type: String,
            required: true
        },
        expectedReturn: {
            type: String,
            required: true
        },
        completed: { 
            type: Boolean, 
            required: true 
        },
    }
)

export const FinancialGoals = mongoose.model("FinancialGoals", financialGoalsSchema);