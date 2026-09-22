import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"hush. — Stories, closer.",description:"A global audiobook library with a favourite-person voice experience."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}