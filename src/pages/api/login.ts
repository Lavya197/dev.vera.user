import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type Buyer = {
  id: number;
  full_name: string;
  email: string;
  password: string;
  wallet_pubkey: string | null;
  status: string;
  created_at: string;
};

type ResponseData = {
  success: boolean;
  message?: string;
  buyer?: Buyer;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  const { data: buyer, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("email", email)
    .single<Buyer>();

  if (error || !buyer) {
    return res.status(401).json({ success: false, message: "Invalid email" });
  }

  if (buyer.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid password" });
  }

  return res.status(200).json({ success: true, buyer });
}
