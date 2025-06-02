import bcrypt from "bcryptjs";

const passUtil = {
    async compare(pass, hashedPass) {
        try {
            if (!pass || !hashedPass) {
                throw new Error("Password or hashed password is missing");
            }
            return await bcrypt.compare(pass, hashedPass);
        } catch (err) {
            console.error("Error in passUtil.compare:", err);
            throw new Error("Error comparing password");
        }
    }
};

export default passUtil;