// A custom error class for Firestore permission errors.
export class FirestorePermissionError extends Error {
  constructor(public context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;

    // A detailed, developer-facing message that will appear in the Next.js error overlay.
    const devMessage = `
Firestore Security Rules Denied Request:
  - Path: ${path}
  - Operation: ${operation}
  - Request Data: ${JSON.stringify(requestResourceData, null, 2)}
This error is being surfaced by the FirestorePermissionError class.
Check your Firestore security rules to ensure the request is allowed.
    `;

    // A generic message for the user.
    super("Missing or insufficient permissions.");
    this.name = "FirestorePermissionError";

    // Attach the detailed context for debugging, but ensure it's not enumerable
    // to prevent it from being serialized in unexpected places.
    Object.defineProperty(this, 'context', {
      value: context,
      enumerable: false, // This is key!
      writable: true,
      configurable: true,
    });

    // You can decide if you want the detailed message in the stack trace during development
    if (process.env.NODE_ENV === 'development') {
      this.stack = `${devMessage}\n${new Error().stack}`;
    }
  }
}

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};
