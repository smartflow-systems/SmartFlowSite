export const metadata = { title: "SmartFlowSite" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body style={{background:"#0D0D0D",color:"#fff"}}>{children}</body></html>;
}
