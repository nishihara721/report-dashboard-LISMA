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
    '/flow/:path*',
    '/media/:path*',
    '/code/:path*',
    '/admin/:path*',
  ],
};