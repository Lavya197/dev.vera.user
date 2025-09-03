import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type ResponseData = {
  success: boolean;
  message?: string;
  buyer?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // Fetch buyer by email
  const { data: buyer, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !buyer) {
    return res.status(401).json({ success: false, message: "Invalid email" });
  }

  // Direct password check (since not hashed)
  if (buyer.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid password" });
  }

  return res.status(200).json({ success: true, buyer });
}
