import { clerkClient } from "@clerk/nextjs/server";

export interface UserDetails {
  email: string;
  firstName: string | null;
}

/**
 * Fetch user email address from Clerk by userId
 * @param userId - Clerk user ID
 * @returns User email address or null if not found
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    return (
      primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || null
    );
  } catch (error) {
    console.error(`Error fetching user email for userId ${userId}:`, error);
    return null;
  }
}

/**
 * Fetch user details (email and firstName) from Clerk by userId
 * @param userId - Clerk user ID
 * @returns User details or null if not found
 */
export async function getUserDetails(
  userId: string
): Promise<UserDetails | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    const email =
      primaryEmail?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      null;

    if (!email) {
      console.warn(`No email found for userId ${userId}`);
      return null;
    }

    return {
      email,
      firstName: user.firstName || null,
    };
  } catch (error) {
    console.error(`Error fetching user details for userId ${userId}:`, error);
    return null;
  }
}
