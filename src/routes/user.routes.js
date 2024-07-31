import { Router } from 'express';
import { registerUser, loginUser, logoutUser, refreshAccesToken, addFamilyBackground, addCareerInfo, addExpenses, addRiskAppetite, addFinancialGoals, addExistingDebt } from '../controller/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.route("/register").post(
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/logout").post(
    verifyJWT,
    logoutUser
)

router.route("/refresh-token").post(
    refreshAccesToken
)

router.route("/family-background").post(
    verifyJWT,
    addFamilyBackground
)

router.route("/career-info").post(
    verifyJWT,
    addCareerInfo
)

router.route("/expenses").post(
    verifyJWT,
    addExpenses
)

router.route("/risk-appetite").post(
    verifyJWT,
    addRiskAppetite
)

router.route("/financial-goals").post(
    verifyJWT,
    addFinancialGoals
)

router.route("/existing-debt").post(
    verifyJWT,
    addExistingDebt
)

export default router;