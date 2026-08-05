import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/summary/:path*',
    '/period/:path*',
    '/popup/:path*',
    '/exit/:path*',
    '/scenario/:path*',
    '/appeal/:path*',
    '/shared/:path*',
    '/admin/:path*',
    // '/scenario-steps/:path*',
  ],
};