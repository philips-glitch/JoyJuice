import { CredentialsSignin } from "next-auth";

/**
 * Thrown from the Credentials provider's `authorize()` when the account
 * exists, the password is correct, but the account is still pending admin
 * verification. Kept distinct from the generic "wrong credentials" failure
 * so the login form can show an explicit, helpful message — unlike a
 * suspended account, "pending verification" isn't something we need to hide
 * from the person who just registered it.
 */
export class AccountNotVerifiedError extends CredentialsSignin {
  code = "account_not_verified";
}
