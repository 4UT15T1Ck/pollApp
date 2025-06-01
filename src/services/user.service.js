import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passUtil from "../utils/pass.util.js";

class UserService {
    async register(userData) {
        const { name, email, password, role } = userData;
        let existingUser = await UserModel.findOne({ email });
        if (existingUser) throw new Error("User already exists with this email");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ name, email, password: hashedPassword, role });
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = await passUtil.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        const payload = { id: user._id, role: user.role, name: user.name };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = jwt.sign({id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

        return { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
    }

    async getProfile(userId) {
        const user = await UserModel.findById(userId).select("-password");
        if (!user) throw new Error("User not found");
        return user;
    }

    async updateProfile(userId, updateData) {
        if (updateData.role) delete updateData.role;
        if (updateData.password) delete updateData.password;

        const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        if (!user) throw new Error("User not found for update");
        return user;
    }

    async createUser(userData) {
        const { name, email, password, role } = userData;
         let existingUser = await UserModel.findOne({ email });
         if (existingUser) throw new Error("User already exists with this email");

         const hashedPassword = await bcrypt.hash(password, 10);
         const user = new UserModel({ name, email, password: hashedPassword, role });
         await user.save();
         const userResponse = user.toObject();
         delete userResponse.password;
         return userResponse;
    }

    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const users = await UserModel.find().select("-password").skip(skip).limit(limit);
        const total = await UserModel.countDocuments();
        return { users, total, page, limit };
    }

    async getUserById(userId) {
        const user = await UserModel.findById(userId).select("-password");
         if (!user) throw new Error("User not found");
         return user;
    }

    async updateUserById(userId, updateData) {
         if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
         }
        const user = await UserModel.findByIdAndUpdate(userId, {$set: updateData}, { new: true }).select("-password");
        if (!user) throw new Error("User not found for update by ID");
        return user;
    }

    async deleteUserById(userId) {
        const user = await UserModel.findByIdAndDelete(userId);
        if (!user) throw new Error("User not found for deletion");
        return { message: "User deleted successfully" };
    }
}

export default new UserService();