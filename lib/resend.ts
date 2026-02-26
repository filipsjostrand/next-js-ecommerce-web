import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// Skapar bara instansen om nyckeln finns, annars null
export const resend = apiKey ? new Resend(apiKey) : null;