import {NextResponse} from "next/server";
import {auth} from "@/auth";

export default auth((req)=>{
    const isLoggedIn = !!req.auth;
    const {pathname, search} = req.nextUrl;

    const isStudentRoute = pathname.startsWith("/student") || pathname.startsWith("/planner")

    if(isStudentRoute && !isLoggedIn){ 
        const callbackUrl = encodeURIComponent(`${pathname}${search}`);
        const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}&message=กรุณาเข้าสู่ระบบก่อนใช้งาน`, req.url);
        return NextResponse.redirect(loginUrl);
     }
     return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};