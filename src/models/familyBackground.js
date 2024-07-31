import mongoose, { Schema } from "mongoose";

const familyBackgroundSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        householdSize: { 
            type: Number, 
            required: true 
        },
        dependents: { 
            type: Number, 
            required: true
        },
        familyIncome: { 
            type: Number, 
            required: true
        },
        completed: { 
            type: Boolean, 
            required: true 
        },
    }
);

export const FamilyBackground = mongoose.model("FamilyBackground", familyBackgroundSchema);