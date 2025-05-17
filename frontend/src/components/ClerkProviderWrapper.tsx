import { ClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

const ClerkProviderWrapper = ({ children }: PropsWithChildren) => {
    return(
        <ClerkProvider
          publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          {children}
        </ClerkProvider>
    );
};

export default ClerkProviderWrapper;