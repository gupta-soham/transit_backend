import { Response, Request, NextFunction } from "express";
import { prisma } from "../prismaClient";
import AppError from "../utils/AppError";

//get profile details
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const userId = (req.user as { id: string }).id;
        console.log(userId);

        const user = await prisma.user.findUnique({
            where: { id: userId, emailVerified: true },
            select: { id: true, email: true, name: true, image: true, createdAt: true, phoneNumber: true, gender: true, dob: true },
        })

        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);

    } catch (error) {
        return next(new AppError('Error fetching profile', 500));
    }

}

//update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as { id: string }).id;
        const { name, dob, gender, image } = req.body;

        // Convert date string to Date object if present
        const dobDate = dob ? new Date(dob) : undefined;

        // Prepare update data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (dobDate) updateData.dob = dobDate;
        if (gender) updateData.gender = gender;
        if (image) updateData.image = image; // This should be the base64 string

        // Update user in database
        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, email: true, name: true, image: true, dob: true, gender: true },
        });

        return res.status(200).json(updateUser);
    } catch (error) {
        console.error("Profile update error:", error);
        return next(new AppError('Error updating profile', 500));
    }
}
