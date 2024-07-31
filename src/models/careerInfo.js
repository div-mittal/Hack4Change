import mongoose, { Schema } from "mongoose";

const careerInfoSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        employmentStatus: { 
            type: String, 
            required: true 
        },
        jobStability: {
            type: Number,
            required: true
        },
        incomeLevel: {
            type: Number,
            required: true
        },
        completed: { 
            type: Boolean, 
            required: true 
        },
    }
)

export const CareerInfo = mongoose.model('CareerInfo', careerInfoSchema);