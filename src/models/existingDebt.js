import mongoose, {Schema} from "mongoose";

const existingDebtsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        currentLoans: {
            type: Number,
            required: true
        },
        creditCardDebt: {
            type: Number,
            required: true
        },
        otherDebt: {
            type: Number,
            required: true
        },
        completed: {
            type: Boolean,
            required: true
        },
    }
)

export const ExistingDebt = mongoose.model("ExistingDebt", existingDebtsSchema);