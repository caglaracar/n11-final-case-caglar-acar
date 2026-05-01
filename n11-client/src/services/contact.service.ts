import { http } from "./http";

export type ContactSubmitRequest = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export const contactService = {
  submit: (body: ContactSubmitRequest) =>
    http.post<boolean>("/contact/submit", body, { auth: false }),
};
