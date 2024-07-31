import { User } from "../models/user.model.js";
import { FamilyBackground } from "../models/familyBackground.js";
import { FinancialGoals } from "../models/financialGoals.js";
import { RiskAppetite } from "../models/riskAppetite.js";
import { Expenses } from "../models/expenses.js";
import { CareerInfo } from "../models/careerInfo.js";
import { ExistingDebt } from "../models/existingDebt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { options } from "../constants.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if(
        [fullName, email, password].some((field) => field?.trim() === undefined || field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if(existingUser){
        throw new ApiError(400, "User with this email already exists");
    }

    const user = await User.create({
        email,
        fullName,
        password,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = refreshToken;

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user");
    }

    try {
        // Send email to user for successful registration
        await sendEmail(
            user.email,
            "Registration Successful",
            `Welcome ${user.fullName}, you have successfully registered to our platform`
        );
    } catch (error) {
        throw new ApiError(500, "Registration email could not be sent");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
}
);

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if([email, password].some((field) => field?.trim() === undefined || field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    if(!(await user.isPasswordCorrect(password))){
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");



    return res
    .status(200)
    .cookie("accessToken", accessToken, {options})
    .cookie("refreshToken", refreshToken, {options})
    .json(
        new ApiResponse(200, 
            { user : loggedInUser, accessToken, refreshToken }, 
            "User logged in successfully")
    )
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, 
        { 
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    return res
    .status(200)
    .clearCookie("accessToken", {options})
    .clearCookie("refreshToken", {options})
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )
})

const refreshAccesToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.headers["x-refresh-token"];

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log(decodedToken)
    const user =  User.findById(decodedToken._id);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(user._id);

    return res
    .status(200)
    .cookie("accessToken", accessToken, {options})
    .cookie("refreshToken", refreshToken, {options})
    .json(
        new ApiResponse(200, { accessToken, refreshToken
        }, "Token refreshed successfully")
    )
})

const addFamilyBackground = asyncHandler(async (req, res) => {
    const { householdSize, familyIncome, dependents } = req.body;
    const user = req.user?._id;

    if(!user){
        throw new ApiError(401, "Unauthorized request");
    }

    if([householdSize, familyIncome, dependents].some((field) => field === undefined || field === "")){
        throw new ApiError(400, "All fields are required");
    }

    const familyBackground = await FamilyBackground.create({
        userId: user,
        householdSize,
        familyIncome,
        dependents,
        completed: false
    });

    if(!familyBackground){
        throw new ApiError(500, "Something went wrong while adding family background");
    }

    familyBackground.completed = true;
    await familyBackground.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, familyBackground, "Family background added successfully")
    )
})

const addCareerInfo = asyncHandler(async (req, res) => {
    const { employmentStatus, jobStability, incomeLevel } = req.body;
    const user = req.user?._id;

    if(!user){
        throw new ApiError(401, "Unauthorized request");
    }

    if([employmentStatus, jobStability, incomeLevel].some((field) => field === undefined || field === "")){
        throw new ApiError(400, "All fields are required");
    }

    const careerInfo = await CareerInfo.create({
        userId: user,
        employmentStatus,
        jobStability,
        incomeLevel,
        completed: false
    });

    if(!careerInfo){
        throw new ApiError(500, "Something went wrong while adding career info");
    }

    careerInfo.completed = true;
    await careerInfo.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, careerInfo, "Career info added successfully")
    )
})

const addExpenses = asyncHandler(async (req, res) => {
    const { fixedExpenditure, variableExpenditure } = req.body;

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized request");
    }

    if([fixedExpenditure, variableExpenditure].some((field) => field === undefined || field === "")){
        throw new ApiError(400, "All fields are required");
    }

    const expensesData = await Expenses.create({
        userId,
        fixedExpenditure,
        variableExpenditure,
        completed: false
    });

    if(!expensesData){
        throw new ApiError(500, "Something went wrong while adding expenses");
    }

    expensesData.completed = true;
    await expensesData.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, expensesData, "Expenses added successfully")
    )
});

const addRiskAppetite = asyncHandler(async (req, res) => {
    const { riskLevel } = req.body;

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized request");
    }

    if(riskLevel === undefined || riskLevel === ""){
        throw new ApiError(400, "All fields are required");
    }

    const riskAppetiteData = await RiskAppetite.create({
        userId,
        riskLevel,
        completed: false
    });

    if(!riskAppetiteData){
        throw new ApiError(500, "Something went wrong while adding risk appetite");
    }

    riskAppetiteData.completed = true;
    await riskAppetiteData.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, riskAppetiteData, "Risk appetite added successfully")
    )
});

const addFinancialGoals = asyncHandler(async (req, res) => {
    const { goalType, expectedReturn } = req.body;

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized request");
    }

    if([goalType, expectedReturn].some((field) => field === undefined || field === "")){
        throw new ApiError(400, "All fields are required");
    }

    const financialGoalsData = await FinancialGoals.create({
        userId,
        goalType,
        expectedReturn,
        completed: false
    });

    if(!financialGoalsData){
        throw new ApiError(500, "Something went wrong while adding financial goals");
    }

    financialGoalsData.completed = true;
    await financialGoalsData.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, financialGoalsData, "Financial goals added successfully")
    )
});

const addExistingDebt = asyncHandler(async (req, res) => {
    const { currentLoans, creditCardDebt, otherDebt } = req.body;

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized request");
    }

    if([currentLoans, creditCardDebt, otherDebt].some((field) => field === undefined || field === "")){
        throw new ApiError(400, "All fields are required");
    }

    const existingDebtData = await ExistingDebt.create({
        userId,
        currentLoans,
        creditCardDebt,
        otherDebt,
        completed: false
    });

    if(!existingDebtData){
        throw new ApiError(500, "Something went wrong while adding existing debt");
    }

    existingDebtData.completed = true;
    await existingDebtData.save({ validateBeforeSave: false });

    return res.status(201).json(
        new ApiResponse(201, existingDebtData, "Existing debt added successfully")
    )
});


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccesToken,
    addFamilyBackground,
    addCareerInfo,
    addExpenses,
    addRiskAppetite,
    addFinancialGoals,
    addExistingDebt
};