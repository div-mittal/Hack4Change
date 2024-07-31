import mongoose, {Schema} from "mongoose";

const riskAppetiteSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        riskLevel: {
            type: Number,
            required: true
        },
        completed: { 
            type: Boolean, 
            required: true 
        },
    }
)

export const RiskAppetite = mongoose.model('RiskAppetite', riskAppetiteSchema);