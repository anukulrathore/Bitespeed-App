import { Request, Response } from 'express';
import { handleIdentify } from './identify.service';

export const IdentifyUser = async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber){
        return res.status(400).json({error: "Email or Phone Number are required"});
    }

    try {
        const result = await handleIdentify(email, phoneNumber);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}